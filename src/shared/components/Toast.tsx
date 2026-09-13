interface Props { message: string; onClose: () => void; }
export function Toast({ message, onClose }: Props) { return <div className="toast" role="status">{message}<button onClick={onClose}>×</button></div>; }
