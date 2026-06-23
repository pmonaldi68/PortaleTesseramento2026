/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, Trash2, Image } from "lucide-react";
import { FileData } from "../types";

interface FileUploadProps {
  id: string;
  label: string;
  description?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  value: FileData | null;
  onChange: (file: FileData | null) => void;
  required?: boolean;
  error?: string;
}

export default function FileUpload({
  id,
  label,
  description,
  allowedTypes = ["application/pdf", "image/jpeg", "image/png"],
  maxSizeMB = 5,
  value,
  onChange,
  required = false,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setLocalError(null);

    // Valida il tipo di file
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      setLocalError("Tipo di file non supportato. Carica un PDF o un'immagine (JPG, PNG).");
      return;
    }

    // Valida la dimensione del file
    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`Il file supera la dimensione massima consentita di ${maxSizeMB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: reader.result,
        });
      } else {
        setLocalError("Errore durante la lettura del file.");
      }
    };
    reader.onerror = () => {
      setLocalError("Errore nel caricamento del file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImage = value?.type.startsWith("image/");

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700" id={`${id}-label`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-slate-500 leading-normal" id={`${id}-desc`}>
          {description}
        </p>
      )}

      {!value ? (
        <div
          id={id}
          aria-labelledby={`${id}-label`}
          aria-describedby={description ? `${id}-desc` : undefined}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px]
            ${isDragging 
              ? "border-emerald-500 bg-emerald-50/50" 
              : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
            }
            ${(error || localError) ? "border-red-300 bg-red-50/20" : ""}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={allowedTypes.join(",")}
            className="hidden"
            id={`${id}-input`}
          />
          <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400 mb-3 transition-transform group-hover:scale-105">
            <Upload className="w-6 h-6 text-slate-500" />
          </div>
          <span className="text-sm font-medium text-slate-700">
            Trascina qui il file oppure <span className="text-emerald-600 hover:text-emerald-700 underline font-semibold">sfoglia</span>
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Formati supportati: PDF, JPG, PNG (Max {maxSizeMB}MB)
          </span>
        </div>
      ) : (
        <div className="relative border border-slate-200 rounded-xl p-4 bg-emerald-50/20 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 bg-emerald-100/70 rounded-lg text-emerald-700 shrink-0">
              {isImage ? (
                <Image className="w-5 h-5 text-emerald-700" />
              ) : (
                <FileText className="w-5 h-5 text-emerald-700" />
              )}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-medium text-slate-800 truncate" title={value.name}>
                {value.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatSize(value.size)} • Pronto per il caricamento
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded-full gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Caricato
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Rimuovi file"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {(error || localError) && (
        <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error || localError}</span>
        </p>
      )}
    </div>
  );
}
