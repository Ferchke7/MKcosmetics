package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"mkcosmetics/server/internal/infrastructure/telegram"
	"mkcosmetics/server/internal/usecase"
)

type TelegramHandler struct {
	botService *telegram.BotService
	orderUC    *usecase.OrderUseCase
}

func NewTelegramHandler(botService *telegram.BotService, orderUC *usecase.OrderUseCase) *TelegramHandler {
	return &TelegramHandler{
		botService: botService,
		orderUC:    orderUC,
	}
}

// HandleWebhook processes incoming Telegram updates (messages, commands, inline button clicks)
func (h *TelegramHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	var update telegram.TelegramUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, `{"error":"invalid update body"}`, http.StatusBadRequest)
		return
	}

	// 1. Handle Inline Button Callback Query
	if update.CallbackQuery != nil {
		cb := update.CallbackQuery
		go h.processCallbackQuery(context.Background(), cb)
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"ok":true}`))
		return
	}

	// 2. Handle Text Commands
	if update.Message != nil && update.Message.Text != "" {
		msg := update.Message
		go h.processTextMessage(context.Background(), msg)
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"ok":true}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"ok":true}`))
}

func (h *TelegramHandler) processCallbackQuery(ctx context.Context, cb *telegram.TelegramCallbackQuery) {
	data := cb.Data
	managerName := cb.From.FirstName
	if cb.From.LastName != "" {
		managerName += " " + cb.From.LastName
	}
	if cb.From.Username != "" {
		managerName += " (@" + cb.From.Username + ")"
	}

	// Parse Callback Action: "status:<newStatus>:<orderID>" or "assign:me:<orderID>"
	parts := strings.Split(data, ":")
	if len(parts) >= 3 {
		action := parts[0]

		if action == "status" {
			newStatus := parts[1]
			orderID, err := strconv.ParseInt(parts[2], 10, 64)
			if err == nil {
				// Update in CRM DB
				order, err := h.orderUC.UpdateStatusFromTelegram(ctx, orderID, newStatus, managerName)
				if err == nil && order != nil {
					_ = h.botService.AnswerCallbackQuery(ctx, cb.ID, fmt.Sprintf("✅ Статус заказа #%s обновлен: %s", order.OrderNumber, newStatus), false)

					if cb.Message != nil {
						newText := h.botService.FormatOrderMessage(order, fmt.Sprintf("Менеджер %s перевел заказ в статус '%s'", managerName, newStatus))
						newKeyboard := h.botService.BuildOrderKeyboard(order)

						_ = h.botService.EditMessageText(ctx, telegram.EditMessageTextPayload{
							ChatID:      strconv.FormatInt(cb.Message.Chat.ID, 10),
							MessageID:   cb.Message.MessageID,
							Text:        newText,
							ParseMode:   "Markdown",
							ReplyMarkup: newKeyboard,
						})
					}
					return
				}
			}
		} else if action == "assign" && parts[1] == "me" {
			orderID, err := strconv.ParseInt(parts[2], 10, 64)
			if err == nil {
				order, err := h.orderUC.AssignManagerFromTelegram(ctx, orderID, managerName)
				if err == nil && order != nil {
					_ = h.botService.AnswerCallbackQuery(ctx, cb.ID, fmt.Sprintf("👤 Заказ #%s назначен на вас (%s)!", order.OrderNumber, managerName), false)

					if cb.Message != nil {
						newText := h.botService.FormatOrderMessage(order, fmt.Sprintf("Заказ взят в работу менеджером %s", managerName))
						newKeyboard := h.botService.BuildOrderKeyboard(order)

						_ = h.botService.EditMessageText(ctx, telegram.EditMessageTextPayload{
							ChatID:      strconv.FormatInt(cb.Message.Chat.ID, 10),
							MessageID:   cb.Message.MessageID,
							Text:        newText,
							ParseMode:   "Markdown",
							ReplyMarkup: newKeyboard,
						})
					}
					return
				}
			}
		}
	}

	_ = h.botService.AnswerCallbackQuery(ctx, cb.ID, "Действие выполнено", false)
}

func (h *TelegramHandler) processTextMessage(ctx context.Context, msg *telegram.TelegramMessage) {
	text := strings.TrimSpace(msg.Text)
	chatIDStr := strconv.FormatInt(msg.Chat.ID, 10)

	switch {
	case strings.HasPrefix(text, "/start"):
		welcomeText := `🌸 *MK KOREA COSMETIC — CRM БОТ ЗАКАЗОВ* 🌸
━━━━━━━━━━━━━━━━━━━━
Добро пожаловать в систему управления заказами MK Cosmetics!

📌 *Доступные команды:*
• /orders — Список последних активных заказов
• /stats — Быстрая статистика продаж
• /order <номер> — Поиск заказа по номеру (например, /order MK-00123)

Все новые заказы с сайта мгновенно приходят сюда с кнопками смены статуса и связи с клиентом.`

		_ = h.botService.SendMessage(ctx, telegram.SendMessagePayload{
			ChatID:    chatIDStr,
			Text:      welcomeText,
			ParseMode: "Markdown",
		})

	case strings.HasPrefix(text, "/orders"):
		ordersResp, err := h.orderUC.GetOrders(ctx, "new", "", 5, 0)
		if err != nil || len(ordersResp.Orders) == 0 {
			// Fallback: any active orders
			ordersResp, _ = h.orderUC.GetOrders(ctx, "", "", 5, 0)
		}

		if ordersResp == nil || len(ordersResp.Orders) == 0 {
			_ = h.botService.SendMessage(ctx, telegram.SendMessagePayload{
				ChatID:    chatIDStr,
				Text:      "📭 Активных новых заказов в CRM пока нет.",
				ParseMode: "Markdown",
			})
			return
		}

		_ = h.botService.SendMessage(ctx, telegram.SendMessagePayload{
			ChatID:    chatIDStr,
			Text:      fmt.Sprintf("📋 *Последние заказы в CRM (%d):*", len(ordersResp.Orders)),
			ParseMode: "Markdown",
		})

		for _, o := range ordersResp.Orders {
			_ = h.botService.SendOrderNotification(ctx, o, chatIDStr)
		}

	case strings.HasPrefix(text, "/stats"):
		ordersResp, _ := h.orderUC.GetOrders(ctx, "", "", 100, 0)
		totalCount := 0
		var totalSum float64 = 0
		if ordersResp != nil {
			totalCount = ordersResp.Total
			for _, o := range ordersResp.Orders {
				totalSum += o.TotalAmount
			}
		}

		statsText := fmt.Sprintf(`📊 *СТАТИСТИКА CRM MK COSMETICS*
━━━━━━━━━━━━━━━━━━━━
📦 Всего заказов: *%d*
💰 Сумма оборота: *%.0f KRW* (~%.0f сум)

Смотрите подробную аналитику и графики в веб-панели управления.`,
			totalCount, totalSum, totalSum*9.2)

		_ = h.botService.SendMessage(ctx, telegram.SendMessagePayload{
			ChatID:    chatIDStr,
			Text:      statsText,
			ParseMode: "Markdown",
		})

	case strings.HasPrefix(text, "/order"):
		parts := strings.Fields(text)
		if len(parts) < 2 {
			_ = h.botService.SendMessage(ctx, telegram.SendMessagePayload{
				ChatID: chatIDStr,
				Text:   "ℹ️ Укажите номер заказа: `/order MK-00123`",
			})
			return
		}

		query := parts[1]
		order, err := h.orderUC.GetOrderByNumber(ctx, query)
		if err != nil || order == nil {
			_ = h.botService.SendMessage(ctx, telegram.SendMessagePayload{
				ChatID: chatIDStr,
				Text:   fmt.Sprintf("❌ Заказ с номером `%s` не найден в CRM.", query),
			})
			return
		}

		_ = h.botService.SendOrderNotification(ctx, order, chatIDStr)
	}
}

// NotifyOrderTelegram manually dispatches an order from CRM panel to Telegram
func (h *TelegramHandler) NotifyOrderTelegram(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid order id"}`, http.StatusBadRequest)
		return
	}

	var reqBody struct {
		CustomChatID string `json:"customChatId"`
	}
	_ = json.NewDecoder(r.Body).Decode(&reqBody)

	order, err := h.orderUC.GetOrderByID(r.Context(), id)
	if err != nil || order == nil {
		http.Error(w, `{"error":"order not found"}`, http.StatusNotFound)
		return
	}

	err = h.botService.SendOrderNotification(r.Context(), order, reqBody.CustomChatID)
	if err != nil {
		log.Printf("Failed to dispatch order notification: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Заказ #%s успешно отправлен в Telegram!", order.OrderNumber),
	})
}

// GetBotConfig returns current status of Telegram bot integration
func (h *TelegramHandler) GetBotConfig(w http.ResponseWriter, r *http.Request) {
	isConfigured := h.botService.IsConfigured()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"isConfigured": isConfigured,
	})
}
