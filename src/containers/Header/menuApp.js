export const adminMenu = [
  {
    //Quan li nguoi dung
    name: "menu.admin.manage-user",
    menus: [
      {
        name: "menu.admin.crud-redux",
        link: "/system/user-redux",
      },
      {
        name: "menu.admin.manage-doctor",
        link: "/system/manage-doctor",
      },
      {
        name: "menu.admin.manage-specialty",
        link: "/system/manage-specialty",
      },
      {
        //quản lý kế hoạch khám bệnh của bác sĩ
        name: "menu.doctor.manage-schedule",
        link: "/doctor/manage-schedule",
      },
      {
        name: "menu.doctor.chat-patient",
        link: "/doctor/chat",
      },
    ],
  },
  {
    //quản lý phòng khám
    name: "menu.admin.clinic",
    menus: [
      {
        name: "menu.admin.manage-clinic",
        link: "/system/manage-clinic",
      },
    ],
  },
  {
    //quản lý chuyên khoa
    name: "menu.admin.specialty",
    menus: [
      {
        name: "menu.admin.manage-specialty",
        link: "/system/manage-specialty",
      },
    ],
  },
  {
    //quản lý cẩm nang
    name: "menu.admin.handbook",
    menus: [
      {
        name: "menu.admin.manage-handbook",
        link: "/system/manage-handbook",
      },
    ],
  },
  {
    //quản lý câu hỏi sức khỏe
    name: "menu.admin.manage-question",
    menus: [
      {
        name: "menu.admin.manage-question",
        link: "/system/manage-question",
      },
    ],
  },
];
export const doctorMenu = [
  {
    name: "menu.doctor.doctor-menu",
    menus: [
      {
        name: "menu.doctor.manage-patient",
        link: "/doctor/manage-patient",
      },
      {
        name: "menu.doctor.manage-schedule",
        link: "/doctor/manage-schedule",
      },
      {
        name: "menu.doctor.chat-patient",
        link: "/doctor/chat",
      },
    ],
  },
];
export const cashierMenu = [
  {
    name: "menu.cashier.cashier-menu",
    menus: [
      {
        name: "menu.cashier.manage-payment",
        link: "/system/manage-payment",
      },
      {
        name: "menu.doctor.chat-patient",
        link: "/doctor/chat",
      },
    ],
  },
];
