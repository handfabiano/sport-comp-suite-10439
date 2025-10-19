import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface EntityCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  badges?: { label: string; variant?: "default" | "secondary" | "outline" }[];
  onClick?: () => void;
  actions?: ReactNode;
  footer?: ReactNode;
}

export default function EntityCard({
  title,
  subtitle,
  imageUrl,
  badges,
  onClick,
  actions,
  footer,
}: EntityCardProps) {
  return (
    <Card
      className={`group transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-lg hover-scale" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {imageUrl !== undefined && (
            <Avatar className="h-16 w-16">
              <AvatarImage src={imageUrl || ""} alt={title} />
              <AvatarFallback>{title.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
            {badges && badges.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {badges.map((badge, index) => (
                  <Badge key={index} variant={badge.variant || "default"}>
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
        {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
      </CardContent>
    </Card>
  );
}
