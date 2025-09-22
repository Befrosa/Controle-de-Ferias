import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users";
import "@pnp/sp/profiles";
import { IUserInfo } from "./forms/IVacationFormTypes";

export class UserService {
  private _sp: SPFI;

  constructor(sp: SPFI) {
    this._sp = sp;
  }

  public async getUsers(searchText?: string): Promise<IUserInfo[]> {
    try {
      // Primeiro, tentar obter usuários do site
      const siteUsers = await this._sp.web.siteUsers
        .select("Id", "Title", "Email", "LoginName")
        .filter(`PrincipalType eq 1`)
        .top(100)();

      let filteredUsers = siteUsers
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
        })) as IUserInfo[];

      // Tentar obter informações adicionais do perfil do usuário
      for (let i = 0; i < filteredUsers.length; i++) {
        try {
          const userProfile = await this._sp.profiles.getPropertiesFor(filteredUsers[i].email);
          console.log('User profile data for', filteredUsers[i].email, ':', userProfile);
          
          // Verificar se há informações de cargo e departamento
          if (userProfile && userProfile.UserProfileProperties) {
            const jobTitleProp = userProfile.UserProfileProperties.find((prop: any) => prop.Key === 'Title');
            const departmentProp = userProfile.UserProfileProperties.find((prop: any) => prop.Key === 'Department');
            
            if (jobTitleProp) {
              filteredUsers[i].jobTitle = jobTitleProp.Value;
            }
            
            if (departmentProp) {
              filteredUsers[i].department = departmentProp.Value;
            }
          }
        } catch (profileError) {
          console.warn('Could not fetch profile for user', filteredUsers[i].email, ':', profileError);
          // Continuar mesmo se não conseguir obter o perfil
        }
      }

      if (searchText && searchText.length > 0) {
        const search = searchText.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.displayName.toLowerCase().indexOf(search) !== -1 ||
          user.email.toLowerCase().indexOf(search) !== -1 ||
          (user.jobTitle && user.jobTitle.toLowerCase().indexOf(search) !== -1) ||
          (user.department && user.department.toLowerCase().indexOf(search) !== -1)
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

      const userInfo: IUserInfo = {
        id: user.Id.toString(),
        displayName: user.Title,
        email: user.Email
      };

      console.log('Usuário obtido por ID:', userInfo);

      // Tentar obter informações adicionais do perfil do usuário
      try {
        const userProfile = await this._sp.profiles.getPropertiesFor(user.Email);
        console.log('User profile data for', user.Email, ':', userProfile);
        
        if (userProfile && userProfile.UserProfileProperties) {
          const jobTitleProp = userProfile.UserProfileProperties.find((prop: any) => prop.Key === 'Title');
          const departmentProp = userProfile.UserProfileProperties.find((prop: any) => prop.Key === 'Department');
          
          if (jobTitleProp) {
            userInfo.jobTitle = jobTitleProp.Value;
          }
          
          if (departmentProp) {
            userInfo.department = departmentProp.Value;
          }
        }
      } catch (profileError) {
        console.warn('Could not fetch profile for user', user.Email, ':', profileError);
      }

      return userInfo;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return undefined;
    }
  }
}