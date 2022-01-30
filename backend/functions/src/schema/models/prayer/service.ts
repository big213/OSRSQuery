import { AccessControlMap } from "../../../types";
import { PaginatedService } from "../../core/services";

export class PrayerService extends PaginatedService {
  defaultTypename = "prayer";

  filterFieldsMap = {
    id: {},
    "createdBy.id": {},
  };

  sortFieldsMap = {
    id: {},
    createdAt: {},
    updatedAt: {},
  };

  searchFieldsMap = {
    name: {},
  };

  accessControl: AccessControlMap = {
    get: () => true,
    getMultiple: () => true,
  };
}
