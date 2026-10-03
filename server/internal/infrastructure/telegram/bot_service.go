package telegram

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
)

type BotService struct {
	token       string
	adminChatID string
	client      *http.Client
}

func NewBotService() *BotService {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	adminChatID := os.Getenv("TELEGRAM_ADMIN_CHAT_ID")

	return &BotService{
		token:       token,
		adminChatID: adminChatID,
		client:      &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *BotService) IsConfigured() bool {
	return s.token != "" && (s.adminChatID != "" || true)
}

func (s *BotService) SetConfig(token, adminChatID string) {
	if token != "" {
		s.token = token
	}
	if adminChatID != "" {
		s.adminChatID = adminChatID
	}
}

type InlineKeyboardButton struct {
	Text          string `json:"text"`
	CallbackData  string `json:"callback_data,omitempty"`
	URL           string `json:"url,omitempty"`
}

type InlineKeyboardMarkup struct {
	InlineKeyboard [][]InlineKeyboardButton `json:"inline_keyboard"`
}

type SendMessagePayload struct {
	ChatID      string                `json:"chat_id"`
	Text        string                `json:"text"`
	ParseMode   string                `json:"parse_mode,omitempty"`
	ReplyMarkup *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

type EditMessageTextPayload struct {
	ChatID      string                `json:"chat_id"`
	MessageID   int64                 `json:"message_id"`
	Text        string                `json:"text"`
	ParseMode   string                `json:"parse_mode,omitempty"`
	ReplyMarkup *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

type AnswerCallbackQueryPayload struct {
	CallbackQueryID string `json:"callback_query_id"`
	Text            string `json:"text,omitempty"`
	ShowAlert       bool   `json:"show_alert,omitempty"`
}

// Telegram Update structures
type TelegramUser struct {
	ID        int64  `json:"id"`
	IsBot     bool   `json:"is_bot"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name,omitempty"`
	Username  string `json:"username,omitempty"`
}

type TelegramChat struct {
	ID    int64  `json:"id"`
	Type  string `json:"type"`
	Title string `json:"title,omitempty"`
}

type TelegramMessage struct {
	MessageID int64         `json:"message_id"`
	From      *TelegramUser `json:"from,omitempty"`
	Chat      TelegramChat  `json:"chat"`
	Text      string        `json:"text,omitempty"`
	Date      int64         `json:"date"`
}

type TelegramCallbackQuery struct {
	ID      string           `json:"id"`
	From    TelegramUser     `json:"from"`
	Message *TelegramMessage `json:"message,omitempty"`
	Data    string           `json:"data"`
}

type TelegramUpdate struct {
	UpdateID      int64                  `json:"update_id"`
	Message       *TelegramMessage       `json:"message,omitempty"`
	CallbackQuery *TelegramCallbackQuery `json:"callback_query,omitempty"`
}

// Format order into rich markdown
func (s *BotService) FormatOrderMessage(order *entity.Order, managerNote string) string {
	var sb strings.Builder

	statusEmoji := "🆕"
	statusText := "Новый заказ"
	switch order.Status {
	case "processing":
		statusEmoji = "⏳"
		statusText = "В обработке (Сборка)"
	case "shipped":
		statusEmoji = "🚚"
		statusText = "Отправлен (В пути)"
	case "delivered", "completed":
		statusEmoji = "✅"
		statusText = "Доставлен и завершен"
	case "cancelled":
		statusEmoji = "❌"
		statusText = "Отменен"
	}

	sb.WriteString(fmt.Sprintf("🛍️ *ЗАКАЗ #%s* [%s %s]\n", order.OrderNumber, statusEmoji, statusText))
	sb.WriteString("━━━━━━━━━━━━━━━━━━━━\n")
	sb.WriteString(fmt.Sprintf("👤 *Клиент:* %s\n", order.CustomerName))

	sb.WriteString(fmt.Sprintf("📱 *Телефон:* `%s`\n", order.Phone))

	if order.City != "" {
		sb.WriteString(fmt.Sprintf("📍 *Регион:* %s\n", order.City))
	}
	if order.ShippingAddress != "" {
		sb.WriteString(fmt.Sprintf("🏠 *Адрес:* %s\n", order.ShippingAddress))
	}
	if order.PaymentMethod != "" {
		sb.WriteString(fmt.Sprintf("💳 *Оплата:* %s\n", order.PaymentMethod))
	}
	if order.AssignedTo != "" {
		sb.WriteString(fmt.Sprintf("👨‍💼 *Ответственный:* %s\n", order.AssignedTo))
	}
	if order.TrackingNumber != "" {
		sb.WriteString(fmt.Sprintf("📦 *Трек-номер:* `%s`\n", order.TrackingNumber))
	}

	sb.WriteString("\n📋 *Состав заказа:*\n")
	if len(order.Items) > 0 {
		for i, item := range order.Items {
			priceStr := fmt.Sprintf("%.0f %s", item.Price, item.Currency)
			if item.Currency == "" {
				priceStr = fmt.Sprintf("%.0f KRW", item.Price)
			}
			sb.WriteString(fmt.Sprintf("%d. *%s* — %d шт. (%s)\n", i+1, item.Title, item.Quantity, priceStr))
		}
	} else {
		sb.WriteString("— Позиции уточняются у клиента\n")
	}

	// Approximate UZS conversion for display
	uzsSum := order.TotalAmount * 9.2
	sb.WriteString(fmt.Sprintf("\n💰 *Итого:* *%.0f %s* (~%s сум)\n",
		order.TotalAmount, order.Currency, formatMoney(int64(uzsSum))))

	if order.Notes != "" {
		sb.WriteString(fmt.Sprintf("\n💬 *Примечания / Запрос:*\n_%s_\n", order.Notes))
	}

	if managerNote != "" {
		sb.WriteString(fmt.Sprintf("\n⚡ *Событие:* %s\n", managerNote))
	}

	sb.WriteString(fmt.Sprintf("\n⏰ _Создан: %s_", order.CreatedAt.Format("02.01.2006 15:04")))

	return sb.String()
}

// Build interactive buttons for order
func (s *BotService) BuildOrderKeyboard(order *entity.Order) *InlineKeyboardMarkup {
	id := order.ID

	cleanPhone := strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(order.Phone, " ", ""), "-", ""), "+", "")
	waURL := fmt.Sprintf("https://wa.me/%s", cleanPhone)

	keyboard := [][]InlineKeyboardButton{
		{
			{Text: "⏳ В обработку", CallbackData: fmt.Sprintf("status:processing:%d", id)},
			{Text: "🚚 Отправлен", CallbackData: fmt.Sprintf("status:shipped:%d", id)},
		},
		{
			{Text: "✅ Доставлен", CallbackData: fmt.Sprintf("status:delivered:%d", id)},
			{Text: "❌ Отменить", CallbackData: fmt.Sprintf("status:cancelled:%d", id)},
		},
		{
			{Text: "💬 WhatsApp клиента", URL: waURL},
			{Text: "👤 Взять себе", CallbackData: fmt.Sprintf("assign:me:%d", id)},
		},
	}

	return &InlineKeyboardMarkup{InlineKeyboard: keyboard}
}

// Send order notification to Telegram chat
func (s *BotService) SendOrderNotification(ctx context.Context, order *entity.Order, targetChatID string) error {
	if s.token == "" {
		log.Println("ℹ️ TELEGRAM_BOT_TOKEN not configured, skipping Telegram dispatch")
		return nil
	}

	chatID := targetChatID
	if chatID == "" {
		chatID = s.adminChatID
	}
	if chatID == "" {
		log.Println("ℹ️ TELEGRAM_ADMIN_CHAT_ID not configured, skipping Telegram dispatch")
		return nil
	}

	text := s.FormatOrderMessage(order, "")
	keyboard := s.BuildOrderKeyboard(order)

	payload := SendMessagePayload{
		ChatID:      chatID,
		Text:        text,
		ParseMode:   "Markdown",
		ReplyMarkup: keyboard,
	}

	return s.SendMessage(ctx, payload)
}

func (s *BotService) SendMessage(ctx context.Context, payload SendMessagePayload) error {
	if s.token == "" {
		return nil
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", s.token)
	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("telegram API error %d: %s", resp.StatusCode, string(b))
	}

	return nil
}

func (s *BotService) EditMessageText(ctx context.Context, payload EditMessageTextPayload) error {
	if s.token == "" {
		return nil
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/editMessageText", s.token)
	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

func (s *BotService) AnswerCallbackQuery(ctx context.Context, callbackID, text string, showAlert bool) error {
	if s.token == "" {
		return nil
	}

	payload := AnswerCallbackQueryPayload{
		CallbackQueryID: callbackID,
		Text:            text,
		ShowAlert:       showAlert,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/answerCallbackQuery", s.token)
	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

func formatMoney(val int64) string {
	str := fmt.Sprintf("%d", val)
	var res []string
	for len(str) > 3 {
		res = append([]string{str[len(str)-3:]}, res...)
		str = str[:len(str)-3]
	}
	if len(str) > 0 {
		res = append([]string{str}, res...)
	}
	return strings.Join(res, " ")
}
