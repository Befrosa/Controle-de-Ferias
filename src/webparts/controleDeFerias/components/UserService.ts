import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users";
import { IUserInfo } from "./forms/IVacationFormTypes";

export class UserService {
  private _sp: SPFI;

  constructor(sp: SPFI) {
    this._sp = sp;
  }

  public async getUsers(searchText?: string): Promise<IUserInfo[]> {
    try {
      const users = await this._sp.web.siteUsers
        .select("Id", "Title", "Email", "LoginName")
        .filter(`PrincipalType eq 1`)
        .top(100)();

      let filteredUsers = users
        .filter(user =>
          user.Title &&
          user.Email &&
          user.LoginName.indexOf("app@") === -1 &&
          user.LoginName.indexOf("spo-grid") === -1 &&
          user.Title !== "System Account"
        )
        .map(user => ({
          id: user.Id.toString(),
          displayName: user.Title,
          email: user.Email
        }));

      if (searchText && searchText.length > 0) {
        const search = searchText.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.displayName.toLowerCase().indexOf(search) !== -1 ||
          user.email.toLowerCase().indexOf(search) !== -1
        );
      }

      return filteredUsers.sort((a, b) => a.displayName.localeCompare(b.displayName));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  public async getUserById(userId: string): Promise<IUserInfo | undefined> {
    try {
      const user = await this._sp.web.siteUsers.getById(parseInt(userId))
        .select("Id", "Title", "Email")();

      return {
        id: user.Id.toString(),
        displayName: user.Title,
        email: user.Email
      };
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return undefined;
    }
  }
}