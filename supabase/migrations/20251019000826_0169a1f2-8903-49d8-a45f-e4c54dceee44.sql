-- Criar buckets de storage para diferentes tipos de arquivos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('atletas', 'atletas', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('equipes', 'equipes', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]),
  ('eventos', 'eventos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('patrocinadores', 'patrocinadores', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]);

-- Políticas para bucket de atletas
CREATE POLICY "Organizadores podem fazer upload de fotos de atletas"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'atletas' AND
  EXISTS (
    SELECT 1 FROM atletas a
    JOIN equipes e ON a.equipe_id = e.id
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE ev.organizador_id = auth.uid()
  )
);

CREATE POLICY "Fotos de atletas são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'atletas');

CREATE POLICY "Organizadores podem atualizar fotos de atletas"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'atletas' AND
  EXISTS (
    SELECT 1 FROM atletas a
    JOIN equipes e ON a.equipe_id = e.id
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE ev.organizador_id = auth.uid()
  )
);

CREATE POLICY "Organizadores podem deletar fotos de atletas"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'atletas' AND
  EXISTS (
    SELECT 1 FROM atletas a
    JOIN equipes e ON a.equipe_id = e.id
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE ev.organizador_id = auth.uid()
  )
);

-- Políticas para bucket de equipes
CREATE POLICY "Organizadores podem fazer upload de logos de equipes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'equipes' AND
  EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE ev.organizador_id = auth.uid()
  )
);

CREATE POLICY "Logos de equipes são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'equipes');

CREATE POLICY "Organizadores podem atualizar logos de equipes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'equipes' AND
  EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE ev.organizador_id = auth.uid()
  )
);

CREATE POLICY "Organizadores podem deletar logos de equipes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'equipes' AND
  EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE ev.organizador_id = auth.uid()
  )
);

-- Políticas para bucket de eventos
CREATE POLICY "Organizadores podem fazer upload de banners de eventos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'eventos' AND
  EXISTS (
    SELECT 1 FROM eventos ev
    WHERE ev.organizador_id = auth.uid()
  )
);

CREATE POLICY "Banners de eventos são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'eventos');

CREATE POLICY "Organizadores podem atualizar banners de eventos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'eventos' AND
  EXISTS (
    SELECT 1 FROM eventos ev
    WHERE ev.organizador_id = auth.uid()
  )
);

CREATE POLICY "Organizadores podem deletar banners de eventos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'eventos' AND
  EXISTS (
    SELECT 1 FROM eventos ev
    WHERE ev.organizador_id = auth.uid()
  )
);

-- Políticas para bucket de patrocinadores
CREATE POLICY "Organizadores podem fazer upload de logos de patrocinadores"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'patrocinadores' AND auth.uid() IS NOT NULL);

CREATE POLICY "Logos de patrocinadores são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'patrocinadores');

CREATE POLICY "Organizadores podem atualizar logos de patrocinadores"
ON storage.objects FOR UPDATE
USING (bucket_id = 'patrocinadores' AND auth.uid() IS NOT NULL);

CREATE POLICY "Organizadores podem deletar logos de patrocinadores"
ON storage.objects FOR DELETE
USING (bucket_id = 'patrocinadores' AND auth.uid() IS NOT NULL);