import { useEffect, useRef, useState } from "react";
import { socket } from "../lib/socket";

let openSockets = 0;

export const useSockets = (onChange?: () => void) => {
  const [connected, setConnected] = useState(socket.connected);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
    };
    const onDisconnect = () => {
      setConnected(false);
    };
    const onChanged = () => {
      onChangeRef.current?.();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("changed", onChanged);
    openSockets += 1;
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("changed", onChanged);
      openSockets -= 1;
      if (openSockets === 0) socket.disconnect();
    };
  }, []);

  return { connected };
};
