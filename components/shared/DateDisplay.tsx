import { formatDate } from "@/utils/dateUtils";

// Date Display Component
interface DateDisplayProps {
  date: string | number | Date;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ date }) => {
  return (
    <div className="d-flex align-items-center text-muted small">
      <i className="fa fa-calendar me-2 text-primary" style={{ width: 14 }}></i>
      <span>{formatDate(date)}</span>
    </div>
  );
};
