import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";

export class VacationService {
  private _sp: SPFI;

  constructor(sp: SPFI) {
    this._sp = sp;
  }

  /**
   * Fetches all vacation records from the "Controle de ferias" list.
   * @returns A promise that resolves to an array of vacation objects.
   */
  public async getVacations(): Promise<any[]> {
    try {
      const list = this._sp.web.lists.getByTitle("Controle de ferias");
      // Ajustado para usar o campo Colaborador do tipo People Picker e incluir Squad
      const items = await list.items
        .select("Id", "Colaborador/Id", "Colaborador/Title", "Colaborador/EMail", "DataInicio", "DataFim", "TipoFerias", "Observacoes", "Squad")
        .expand("Colaborador")();
      
      // Retornar os dados no formato esperado pela função converterDadosSharePoint
      return items.map(item => ({
        Id: item.Id,
        Colaborador: item.Colaborador ? {
          Id: item.Colaborador.Id,
          Title: item.Colaborador.Title,
          EMail: item.Colaborador.EMail
        } : null,
        DataInicio: item.DataInicio,
        DataFim: item.DataFim,
        TipoFerias: item.TipoFerias,
        Observacoes: item.Observacoes,
        Squad: item.Squad
      }));
    } catch (error) {
      console.error("Error fetching vacations:", error);
      return [];
    }
  }

  /**
   * Creates a new vacation record in the "Controle de ferias" list.
   * @param data - An object containing the new vacation data.
   * @returns A promise that resolves when the creation is complete.
   */
  public async createVacation(data: any): Promise<void> {
    try {
      console.log('Criando férias com dados:', data);
      const list = this._sp.web.lists.getByTitle("Controle de ferias");
      
      // Preparar dados para o campo People Picker
      const itemData: any = {
        DataInicio: data.DataInicio,
        DataFim: data.DataFim,
        TipoFerias: data.TipoFerias,
        Observacoes: data.Observacoes || '',
        Squad: data.Squad || ''
      };
      
      // Adicionar o colaborador se o ID estiver disponível
      if (data.ColaboradorId) {
        itemData.ColaboradorId = data.ColaboradorId;
      }
      
      console.log('Dados a serem salvos:', itemData);
      await list.items.add(itemData);
    } catch (error) {
      console.error("Error creating vacation item:", error);
      throw error;
    }
  }

  /**
   * Updates a vacation record in the "Controle de ferias" list.
   * @param itemId - The ID of the item to update.
   * @param data - An object containing the fields to update.
   * @returns A promise that resolves when the update is complete.
   */
  public async updateVacation(itemId: number, data: any): Promise<void> {
    try {
      console.log('Atualizando férias com ID:', itemId, 'e dados:', data);
      const list = this._sp.web.lists.getByTitle("Controle de ferias");
      
      // Preparar dados para atualização
      const itemData: any = {
        DataInicio: data.DataInicio,
        DataFim: data.DataFim,
        TipoFerias: data.TipoFerias,
        Observacoes: data.Observacoes || '',
        Squad: data.Squad || ''
      };
      
      // Atualizar o colaborador se o ID estiver disponível
      if (data.ColaboradorId) {
        itemData.ColaboradorId = data.ColaboradorId;
      }
      
      console.log('Dados a serem atualizados:', itemData);
      await list.items.getById(itemId).update(itemData);
    } catch (error) {
      console.error(`Error updating vacation item ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a vacation record from the "Controle de ferias" list.
   * @param itemId - The ID of the item to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  public async deleteVacation(itemId: number): Promise<void> {
    try {
      console.log('Deletando item com ID:', itemId);
      const list = this._sp.web.lists.getByTitle("Controle de ferias");
      await list.items.getById(itemId).delete();
    } catch (error) {
      console.error(`Error deleting vacation item ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Gets vacation type options from SharePoint choice field.
   * @returns A promise that resolves to an array of dropdown options.
   */
  public async getVacationTypeOptions(): Promise<Array<{key: string, text: string}>> {
    try {
      const list = this._sp.web.lists.getByTitle("Controle de ferias");
      const field = await list.fields.getByInternalNameOrTitle("TipoFerias")();

      console.log('Campo TipoFerias:', field);

      if (field && field.Choices && field.Choices.length > 0) {
        console.log('Loaded vacation type options from SharePoint:', field.Choices);
        return field.Choices.map((choice: string) => ({
          key: choice,
          text: choice
        }));
      } else {
        console.warn('No choices found in TipoFerias field, using default options');
        return this.getDefaultVacationTypes();
      }
    } catch (error) {
      console.error('Error getting vacation type options from SharePoint:', error);
      // Return default options on error
      return this.getDefaultVacationTypes();
    }
  }

  private getDefaultVacationTypes(): Array<{key: string, text: string}> {
    console.log('Obtendo tipos de férias padrão');
    return [
      { key: 'Férias anuais', text: 'Férias anuais' },
      { key: 'Licença médica', text: 'Licença médica' },
      { key: 'Licença maternidade', text: 'Licença maternidade' },
      { key: 'Licença paternidade', text: 'Licença paternidade' },
      { key: 'Folga compensatória', text: 'Folga compensatória' },
      { key: 'Ausência justificada', text: 'Ausência justificada' },
      { key: 'Outros', text: 'Outros' }
    ];
  }

  /**
   * Gets squad options from SharePoint choice field.
   * @returns A promise that resolves to an array of dropdown options.
   */
  public async getSquadOptions(): Promise<Array<{key: string, text: string}>> {
    try {
      const list = this._sp.web.lists.getByTitle("Controle de ferias");
      const field = await list.fields.getByInternalNameOrTitle("Squad")();

      console.log('Campo Squad:', field);

      if (field && field.Choices && field.Choices.length > 0) {
        console.log('Loaded squad options from SharePoint:', field.Choices);
        return field.Choices.map((choice: string) => ({
          key: choice,
          text: choice
        }));
      } else {
        console.warn('No choices found in Squad field, using default options');
        return this.getDefaultSquadOptions();
      }
    } catch (error) {
      console.error('Error getting squad options from SharePoint:', error);
      // Return default options on error
      return this.getDefaultSquadOptions();
    }
  }

  private getDefaultSquadOptions(): Array<{key: string, text: string}> {
    console.log('Obtendo opções de squad padrão');
    return [
      { key: 'Squad A', text: 'Squad A' },
      { key: 'Squad B', text: 'Squad B' },
      { key: 'Squad C', text: 'Squad C' },
      { key: 'Squad D', text: 'Squad D' }
    ];
  }
}