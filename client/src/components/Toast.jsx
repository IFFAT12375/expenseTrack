import { useEffect } from 'react';
export default function Toast({ message, onClose }) { useEffect(() => { if (!message) return undefined; const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [message, onClose]); return message ? <div className="toast">{message}</div> : null; }
