import { ExternalLink, MapPin, DollarSign, Calendar, Edit3, Trash2, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import type { Application } from "../types";

interface ApplicationCardProps {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
}

export function ApplicationCard({ application, onEdit, onDelete }: ApplicationCardProps) {
  return (
    <Card className="p-5 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {application.position}
            </h3>
            <p className="text-sm font-medium text-secondary mt-0.5">{application.company}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
          {application.appliedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(application.appliedAt).toLocaleDateString()}
            </span>
          )}
          {application.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {application.location}
            </span>
          )}
          {application.salary && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {application.salary}
            </span>
          )}
        </div>

        {application.notes && (
          <p className="text-sm text-secondary line-clamp-2 mt-2">{application.notes}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {application.jobUrl && (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Posting <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(application)}>
            <Edit3 className="w-4 h-4 text-secondary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-danger hover:text-danger/80"
            onClick={() => onDelete(application.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
