import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IVacation } from "./IVacation";

export class VacationService {
  private _sp: SPFI;

  constructor(sp: SPFI) {
    this._sp = sp;
  }

  /**
   * Fetches all vacation records from the "Controle de ferias" list.
   * @returns A promise that resolves to an array of vacation objects.
   */
  public async getVacations(): Promise<IVacation[]> {
    try {
      const list = this._sp.web.lists.getByTitle("Controle de ferias");
      const items = await list.items.select("Id", "Title", "DataInicio", "DataFim")();
      return items.map(item => ({
        Id: item.Id,
        Title: item.Title,
        DataInicio: item.DataInicio ? new Date(item.DataInicio).toISOString().split('T')[0] : "",
        DataFim: item.DataFim ? new Date(item.DataFim).toISOString().split('T')[0] : ""
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
  public async createVacation(data: Partial<IVacation>): Promise<void> {
    try {
      const list = this._sp.web.lists.getByTitle("Controle de ferias");
      await list.items.add(data);
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
  public async updateVacation(itemId: number, data: Partial<IVacation>): Promise<void> {
    try {
      const list = this._sp.web.lists.getByTitle("Controle de ferias");
      await list.items.getById(itemId).update(data);
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
      const list = this._sp.web.lists.getByTitle("Controle de ferias");
      await list.items.getById(itemId).delete();
    } catch (error) {
      console.error(`Error deleting vacation item ${itemId}:`, error);
      throw error;
    }
  }
}