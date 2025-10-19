import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  bucket: "atletas" | "equipes" | "eventos" | "patrocinadores";
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  bucket,
  currentImageUrl,
  onImageUploaded,
  label = "Upload de Imagem",
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validar tamanho do arquivo
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast.error(`O arquivo deve ter no máximo ${maxSizeMB}MB`);
        return;
      }

      // Validar tipo de arquivo
      if (!file.type.match(/^image\/(jpeg|png|webp|svg\+xml)$/)) {
        toast.error("Formato de imagem não suportado");
        return;
      }

      setUploading(true);

      // Criar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(error.message || "Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded("");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg border-2 border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${bucket}`}
          />
          <label
            htmlFor={`file-upload-${bucket}`}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-sm text-muted-foreground">
              {uploading ? "Enviando..." : "Clique para selecionar uma imagem"}
            </div>
            <div className="text-xs text-muted-foreground">
              Máximo {maxSizeMB}MB - JPEG, PNG, WEBP
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
