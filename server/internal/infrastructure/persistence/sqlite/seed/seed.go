package seed

import (
	_ "embed"
)

//go:embed posts.json
var PostsJSON []byte

//go:embed channel.json
var ChannelJSON []byte
