// Avatar Component
interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 32,
  className = "",
}) => (
  <div
    className={`rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0 ${className}`}
    style={{ width: size, height: size }}
  >
    <span className={`fw-bold ${size <= 32 ? "small" : ""}`}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </span>
  </div>
);
