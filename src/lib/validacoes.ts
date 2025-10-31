import { differenceInYears } from "date-fns";

export interface Evento {
  id: string;
  idade_minima?: number;
  idade_maxima?: number;
  sexo_competicao?: string;
  limite_atletas_por_equipe?: number;
  limite_atletas_masculino?: number;
  limite_atletas_feminino?: number;
  data_inicio: string;
  status: string;
}

export interface Atleta {
  id: string;
  nome: string;
  data_nascimento?: string;
  sexo?: string;
}

export function validarIdadeAtleta(atleta: Atleta, evento: Evento): { valido: boolean; mensagem?: string } {
  if (!atleta.data_nascimento) {
    return { valido: false, mensagem: "Atleta sem data de nascimento cadastrada" };
  }

  const idade = differenceInYears(new Date(evento.data_inicio), new Date(atleta.data_nascimento));

  if (evento.idade_minima && idade < evento.idade_minima) {
    return { 
      valido: false, 
      mensagem: `Atleta ${atleta.nome} tem ${idade} anos, mínimo exigido: ${evento.idade_minima}` 
    };
  }

  if (evento.idade_maxima && idade > evento.idade_maxima) {
    return { 
      valido: false, 
      mensagem: `Atleta ${atleta.nome} tem ${idade} anos, máximo permitido: ${evento.idade_maxima}` 
    };
  }

  return { valido: true };
}

export function validarSexoAtleta(atleta: Atleta, evento: Evento): { valido: boolean; mensagem?: string } {
  if (!atleta.sexo) {
    return { valido: false, mensagem: "Atleta sem sexo cadastrado" };
  }

  if (evento.sexo_competicao === "misto") {
    return { valido: true };
  }

  if (evento.sexo_competicao && atleta.sexo !== evento.sexo_competicao) {
    return { 
      valido: false, 
      mensagem: `Competição é ${evento.sexo_competicao}, atleta ${atleta.nome} é ${atleta.sexo}` 
    };
  }

  return { valido: true };
}

export function validarLimitesEquipe(
  atletasEquipe: Atleta[], 
  novoAtleta: Atleta, 
  evento: Evento
): { valido: boolean; mensagem?: string } {
  const totalAtletas = atletasEquipe.length + 1;
  
  if (evento.limite_atletas_por_equipe && totalAtletas > evento.limite_atletas_por_equipe) {
    return { 
      valido: false, 
      mensagem: `Limite de ${evento.limite_atletas_por_equipe} atletas por equipe atingido` 
    };
  }

  if (evento.sexo_competicao === "misto") {
    const masculinos = atletasEquipe.filter(a => a.sexo === "masculino").length + 
                      (novoAtleta.sexo === "masculino" ? 1 : 0);
    const femininos = atletasEquipe.filter(a => a.sexo === "feminino").length + 
                     (novoAtleta.sexo === "feminino" ? 1 : 0);

    if (evento.limite_atletas_masculino && masculinos > evento.limite_atletas_masculino) {
      return { 
        valido: false, 
        mensagem: `Limite de ${evento.limite_atletas_masculino} atletas masculinos atingido` 
      };
    }

    if (evento.limite_atletas_feminino && femininos > evento.limite_atletas_feminino) {
      return { 
        valido: false, 
        mensagem: `Limite de ${evento.limite_atletas_feminino} atletas femininos atingido` 
      };
    }
  }

  return { valido: true };
}

export function podeModificarEquipe(evento: Evento, isOrganizador: boolean): { pode: boolean; mensagem?: string } {
  const eventoIniciado = new Date(evento.data_inicio) <= new Date() || 
                         evento.status === "em_andamento" || 
                         evento.status === "finalizado";

  if (eventoIniciado && !isOrganizador) {
    return { 
      pode: false, 
      mensagem: "Competição já iniciada. Apenas organizadores podem modificar equipes." 
    };
  }

  return { pode: true };
}
