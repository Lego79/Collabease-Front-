import { BASE_URL } from "../../../api/config";

const endpoint = (path: string): string => `${BASE_URL}${path}`;


export const CollabEase = {
    BOARD: {
      GET_ALL_BOARD: endpoint("api/tasks"),
      CREATE_BOARD: endpoint("api/board"),
      GET_TASK_DATA: endpoint("api/tasks/task-data"),
      CREATE_COMMENT: endpoint("api/comment")
      // 다른 BOARD 관련 엔드포인트도 아래처럼 추가
      // 예) CREATE_BOARD: endpoint("api/board/create")
    },


    CONFIGURATION: {
        PUBLIC: {
            GET_ALL_ACTORS: "/api/stowgenie/v1/public/actor",
            GET_ALL_COMPANIES: "/api/stowgenie/v1/public/company",
            GET_ALL_TIMEZONES: "/api/stowgenie/v1/public/time-zone",
            GET_ALL_SERVICES: "/api/stowgenie/v1/public/service",
            GET_ALL_VESSELS: "/api/stowgenie/v1/public/vessel",
            GET_ALL_PORTS: "/api/stowgenie/v1/public/port",
            GET_ALL_TERMINALS: "/api/stowgenie/v1/public/terminal",
            GET_ALL_AFFILIATES: "/api/stowgenie/v1/public/affiliate",
            ACTIVATE: "/api/stowgenie/v1/public/activate"
        },
        USER_REGISTRATION: {
            GET_ALL_USER_REGISTRATIONS: "/api/stowgenie/v1/admin/registration",
            EXPORT: "/api/stowgenie/v1/admin/registration/export-users",
            GET_EMAIL_TEMPLATES: "/api/stowgenie/v1/admin/registration/mail-template",
            CREATE_EMAIL_TEMPLATE: "/api/stowgenie/v1/admin/registration/mail-template",
            UPDATE_EMAIL_TEMPLATE: "/api/stowgenie/v1/admin/registration/mail-template/{templateId}",
            SEND_EMAIL_TEMPLATE: "/api/stowgenie/v1/admin/registration/send-mail",
            IMPORT_NEW: "/api/stowgenie/v1/admin/registration/import-new",
            IMPORT_CURRENT: "/api/stowgenie/v1/admin/registration/import-current",
            DEACTIVATE: "/api/stowgenie/v1/admin/registration/deactivate",
            SAVE: "/api/stowgenie/v1/admin/registration",
            APPROVE: "/api/stowgenie/v1/admin/registration/approve"
        }
    },


};

export default { CollabEase };
