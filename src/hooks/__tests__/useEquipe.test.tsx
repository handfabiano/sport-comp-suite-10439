import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient } from '@/test/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEquipe } from '../useEquipe';
import { supabase } from '@/integrations/supabase/client';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useEquipe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchEquipes', () => {
    it('should fetch all active equipes successfully', async () => {
      const mockEquipes = [
        {
          id: '1',
          nome: 'Equipe A',
          tecnico: 'João Silva',
          modalidade: 'futebol',
          categoria: 'sub-17',
          ativa: true,
          numero_atletas: 15,
          created_at: '2024-01-01',
        },
        {
          id: '2',
          nome: 'Equipe B',
          tecnico: 'Maria Santos',
          modalidade: 'volei',
          categoria: 'sub-15',
          ativa: true,
          numero_atletas: 12,
          created_at: '2024-01-02',
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockEquipes, error: null }),
      } as any);

      const { result } = renderHook(() => useEquipe(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.equipes).toHaveLength(2);
      expect(result.current.equipes[0].nome).toBe('Equipe A');
      expect(supabase.from).toHaveBeenCalledWith('equipes');
    });

    it('should handle fetch error gracefully', async () => {
      const mockError = new Error('Database error');

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      } as any);

      const { result } = renderHook(() => useEquipe(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.equipes).toEqual([]);
    });
  });

  describe('fetchEquipe', () => {
    it('should fetch single equipe by id', async () => {
      const mockEquipe = {
        id: '1',
        nome: 'Equipe Test',
        tecnico: 'Test Coach',
        modalidade: 'futebol',
        categoria: 'sub-17',
        ativa: true,
        numero_atletas: 20,
        created_at: '2024-01-01',
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockEquipe, error: null }),
      } as any);

      const { result } = renderHook(() => useEquipe('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.equipe).toEqual(mockEquipe);
      expect(result.current.equipe?.nome).toBe('Equipe Test');
    });
  });

  describe('createEquipe', () => {
    it('should create new equipe successfully', async () => {
      const mockUser = { user: { id: 'user-123' } };
      const newEquipeData = {
        nome: 'Nova Equipe',
        tecnico: 'Novo Técnico',
        modalidade: 'basquete',
        categoria: 'sub-19',
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as any);
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      const { result } = renderHook(() => useEquipe(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const success = await result.current.createEquipe(newEquipeData);

      expect(success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('equipes');
    });

    it('should handle creation error', async () => {
      const mockUser = { user: { id: 'user-123' } };
      const mockError = new Error('Creation failed');

      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as any);
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: mockError }),
      } as any);

      const { result } = renderHook(() => useEquipe(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const success = await result.current.createEquipe({});

      expect(success).toBe(false);
    });
  });

  describe('updateEquipe', () => {
    it('should update equipe successfully', async () => {
      const updateData = { nome: 'Equipe Atualizada' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      const { result } = renderHook(() => useEquipe(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const success = await result.current.updateEquipe('1', updateData);

      expect(success).toBe(true);
    });
  });

  describe('deleteEquipe', () => {
    it('should delete equipe successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      const { result } = renderHook(() => useEquipe(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const success = await result.current.deleteEquipe('1');

      expect(success).toBe(true);
    });
  });

  describe('inscreverEquipeEmEvento', () => {
    it('should register equipe in evento successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      const { result } = renderHook(() => useEquipe(), { wrapper });

      const success = await result.current.inscreverEquipeEmEvento(
        'equipe-1',
        'evento-1',
        'sub-17'
      );

      expect(success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('inscricoes');
    });

    it('should handle inscription error', async () => {
      const mockError = new Error('Inscription failed');

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: mockError }),
      } as any);

      const { result } = renderHook(() => useEquipe(), { wrapper });

      const success = await result.current.inscreverEquipeEmEvento(
        'equipe-1',
        'evento-1',
        'sub-17'
      );

      expect(success).toBe(false);
    });
  });
});
