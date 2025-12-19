#!/bin/bash

# Configuration
SHADER_PATH="$HOME/.config/hypr/shaders/crt_start.frag"
ANIMATION_DURATION=0.5 # Must match roughly with your shader duration

handle() {
  # Event format: openwindow>>ADDRESS,WORKSPACE,CLASS,TITLE
  # Example: openwindow>>0x564cea2525760,1,kitty,kitty
  case $1 in
    openwindow*)
      # Extract the address (hex string)
      ADDR=$(echo "$1" | cut -d'>' -f3 | cut -d',' -f1)
      
      # 1. Apply the shader to this specific window address
      # We force 'time' to 0 if your shader runner supports resetting uniforms,
      # but standard Hyprland just applies it. The shader relies on system time 
      # usually, but 'windowshader' resets the shader instance.
      hyprctl setprop "address:0x$ADDR" windowshader "$SHADER_PATH"
      
      # 2. Run the cleanup in background so we don't block other windows
      (
        sleep $ANIMATION_DURATION
        # Remove shader (set to empty) or switch to your static CRT overlay
        hyprctl setprop "address:0x$ADDR" windowshader "[[Empty]]"
        # If you have a permanent CRT shader, use that path instead of "[[Empty]]"
      ) &
      ;;
  esac
}

# Listen to the socket
socat -U - UNIX-CONNECT:"$XDG_RUNTIME_DIR/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock" | while read -r line; do handle "$line"; done
