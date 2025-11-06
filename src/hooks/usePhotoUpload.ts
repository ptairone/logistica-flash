import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

interface UploadPhotoOptions {
  file: File;
  viagemId: string;
  categoria: 'partida_painel' | 'chegada_painel' | 'despesa' | 'adiantamento' | 'recebimento_frete' | 'checkpoint' | 'outro';
  metadata?: any;
  captureLocation?: boolean;
}

interface UploadResult {
  id: string;
  url: string;
  thumbnail_url?: string;
  categoria: string;
  metadata: any;
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1920;
          if (width > height && width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
          
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error('Erro ao obter contexto do canvas');
            resolve(file);
            return;
          }
          
          // Preencher com branco antes de desenhar
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            resolve(blob || file);
          }, 'image/jpeg', 0.85);
        };
        img.onerror = () => {
          console.error('Erro ao carregar imagem para compressão');
          resolve(file);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        console.error('Erro ao ler arquivo');
        resolve(file);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro na compressão:', error);
      resolve(file);
    }
  });
}

async function generateThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const THUMB_SIZE = 200;
          
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            width = THUMB_SIZE;
            height = (img.height * THUMB_SIZE) / img.width;
          } else {
            height = THUMB_SIZE;
            width = (img.width * THUMB_SIZE) / img.height;
          }
          
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error('Erro ao obter contexto do canvas para thumbnail');
            resolve(null);
            return;
          }
          
          // Preencher com branco antes de desenhar
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (!blob) {
              console.warn('Falha ao gerar thumbnail blob');
            }
            resolve(blob);
          }, 'image/jpeg', 0.7);
        };
        img.onerror = () => {
          console.error('Erro ao carregar imagem para thumbnail');
          resolve(null);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        console.error('Erro ao ler arquivo para thumbnail');
        resolve(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao gerar thumbnail:', error);
      resolve(null);
    }
  });
}

async function getCurrentLocation(): Promise<GeolocationData | null> {
  if (!navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        });
      },
      () => {
        resolve(null);
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  });
}

function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from('comprovantes').getPublicUrl(path);
  return data.publicUrl;
}

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async ({
    file,
    viagemId,
    categoria,
    metadata = {},
    captureLocation = true,
  }: UploadPhotoOptions): Promise<UploadResult | null> => {
    setUploading(true);
    
    try {
      // 1. Comprimir imagem
      const fotoComprimida = await compressImage(file);
      
      // 2. Gerar thumbnail
      const thumbnailBlob = await generateThumbnail(file);
      
      // 3. Capturar GPS (se solicitado)
      let location: GeolocationData | null = null;
      if (captureLocation) {
        location = await getCurrentLocation();
      }
      
      // 4. Upload da foto principal
      const pasta = categoria.includes('_') ? categoria.split('_')[0] : categoria;
      const timestamp = Date.now();
      const filePath = `${viagemId}/${pasta}/${categoria}_${timestamp}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(filePath, fotoComprimida);
      
      if (uploadError) throw uploadError;
      
      const publicUrl = getPublicUrl(filePath);
      
      // 5. Upload do thumbnail (se foi gerado com sucesso)
      let thumbnailUrl: string | undefined;
      if (thumbnailBlob) {
        try {
          const thumbnailPath = `${viagemId}/${pasta}/thumb_${categoria}_${timestamp}.jpg`;
          const { error: thumbError } = await supabase.storage
            .from('comprovantes')
            .upload(thumbnailPath, thumbnailBlob);
          
          if (!thumbError) {
            thumbnailUrl = getPublicUrl(thumbnailPath);
          } else {
            console.warn('Erro ao fazer upload do thumbnail:', thumbError);
          }
        } catch (thumbErr) {
          console.warn('Falha no upload do thumbnail:', thumbErr);
        }
      }
      
      // 6. Salvar em documentos
      const { data: doc, error: docError } = await supabase
        .from('documentos')
        .insert({
          tipo_entidade: 'viagem',
          entidade_id: viagemId,
          tipo_documento: 'foto',
          categoria: categoria,
          nome: file.name,
          url: publicUrl,
          thumbnail_url: thumbnailUrl,
          latitude: location?.latitude,
          longitude: location?.longitude,
          localizacao_timestamp: location?.timestamp,
          metadata: metadata,
          tamanho: file.size,
          mime_type: file.type,
        })
        .select()
        .single();
      
      if (docError) throw docError;
      
      return {
        id: doc.id,
        url: publicUrl,
        thumbnail_url: thumbnailUrl,
        categoria: categoria,
        metadata: metadata,
      };
      
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast.error('Erro ao fazer upload da foto');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadPhoto, uploading };
}
