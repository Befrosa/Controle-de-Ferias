// Definindo a interface para os membros do time
export interface ITeamMember {
  name: string;
  start: string | undefined;
  end: string | undefined;
}

// Definindo a interface para os meses
export interface IMonth {
  year: number;
  month: number;
  name: string;
}

// Definindo a interface para os conflitos
export interface IVacationConflict {
  member1: string;
  member2: string;
  startDate: Date;
  endDate: Date;
  days: number;
}