
create table if not exists user
(
    id bigint not null comment '主键' primary key,
    name             varchar(50)                              not null comment '姓名',
    gender           varchar(50) default 'male'               not null comment '性别',
    login_id         varchar(50)                              null comment '账号',
    phone_number     varchar(100)                             null,
    password         varchar(200)                             null comment '密码',
    e_mail           varchar(255)                             null comment '用户电子邮件地址',
    remark           varchar(200)                             null comment '备注',
    integration_id   varchar(100)                             null comment '第三方id',
    integration_name varchar(255)                             null comment '第三方名称',
    created_at       datetime(6) default CURRENT_TIMESTAMP(6) null comment '创建时间',
    creator_id       bigint                                   null comment '创建用户主键',
    creator_name     varchar(50)                              null comment '添加人',
    modifier_at      datetime(6) default CURRENT_TIMESTAMP(6) null on update CURRENT_TIMESTAMP(6) comment '上次修改时间',
    modifier_id      bigint                                   null comment '修改用户主键',
    modifier_name    varchar(50)                              null comment '修改人',
    is_removed       tinyint     default 0                    null comment '删除标识',
    version          bigint                                   null comment '版本号'
)
    comment '用户' row_format = DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


create table if not exists sys_module
(
    id            bigint                                     not null comment '模块id'
        primary key,
    code          varchar(100)                               not null comment '模块编码',
    name          varchar(50)   default ''                   not null comment '模块名称',
    module_type   varchar(10)   default 'web'                not null comment 'url外部 / internal一般页面',
    type          varchar(64)   default 'module'             not null comment '模块类型 module/group',
    url           varchar(1000)                              null comment '模块地址',
    product_id    bigint                                     not null comment '关联产品id',
    icon          varchar(125)                               null comment '菜单图标',
    sort_code     int           default 0                    not null comment '排序',
    is_disabled   tinyint(1)    default 0                    null comment '禁用',
    is_visible    tinyint(1)    default 0                    null comment '隐藏标识',
    is_default    tinyint(1)    default 0                    null comment '产品默认菜单',
    parent_id     bigint                                     not null comment '上级模块id',
    full_id       varchar(1000) default ''                   not null comment 'id链全称',
    full_name     varchar(2000) default ''                   not null comment '名称全称',
    level         int                                        null comment '层级',
    is_leaf       tinyint(1)    default 0                    null,
    creator_id    bigint                                     null comment '添加人主键',
    creator_name  varchar(50)                                null comment '添加人',
    created_at    datetime      default (now())              null comment '创建时间',
    modifier_id   bigint                                     null comment '修改人主键',
    modifier_name varchar(50)                                null comment '修改人',
    modifier_at   datetime(6)   default CURRENT_TIMESTAMP(6) null on update CURRENT_TIMESTAMP(6) comment '修改时间',
    version       bigint                                     null comment '版本',
    is_removed    tinyint(1)    default 0                    not null comment '删除标记'
)
    comment '模块管理表' row_format = DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create table if not exists sys_operator
(
    id            bigint                                   not null
        primary key,
    user_id       bigint                                   not null comment 'SaaS系统人员账号ID',
    creator_id    bigint                                   null comment '添加人主键',
    creator_name  varchar(50)                              null comment '添加人',
    created_at    datetime(6) default CURRENT_TIMESTAMP(6) null comment '创建时间',
    modifier_id   bigint                                   null comment '修改人主键',
    modifier_name varchar(50)                              null comment '修改人',
    modifier_at   datetime(6) default CURRENT_TIMESTAMP(6) null on update CURRENT_TIMESTAMP(6) comment '修改时间',
    version       bigint                                   null comment '版本',
    is_removed    tinyint(1)  default 0                    not null comment '删除标记'
)
    comment '内部系统登录人员表' row_format = DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create table if not exists sys_permission
(
    id            bigint                                   not null comment '权限项ID'
        primary key,
    name          varchar(125)                             not null comment '权限名称',
    code          varchar(255)                             not null comment '产品编码',
    module_id     bigint                                   not null comment '关联模块ID',
    description   varchar(255)                             null comment '权限项描述',
    creator_id    bigint                                   null comment '添加人主键',
    creator_name  varchar(50)                              null comment '添加人',
    created_at    datetime(6) default CURRENT_TIMESTAMP(6) null comment '创建时间',
    modifier_id   bigint                                   null comment '修改人主键',
    modifier_name varchar(50)                              null comment '修改人',
    modifier_at   datetime(6) default CURRENT_TIMESTAMP(6) null on update CURRENT_TIMESTAMP(6) comment '修改时间',
    version       bigint                                   null comment '版本',
    is_removed    tinyint(1)  default 0                    not null comment '删除标记'
)
    comment '权限项管理表' row_format = DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create table if not exists sys_product
(
    id            bigint                                   not null comment '产品ID'
        primary key,
    name          varchar(50)                              not null comment '产品名称',
    code          varchar(50)                              not null comment '产品编码',
    product_type  varchar(50) default 'web'                not null comment 'mobile:移动端, web:pc',
    is_disabled   tinyint(1)  default 0                    not null comment '禁用,禁用后产品无法被用户使用',
    icon          varchar(125)                             null comment '产品图标',
    sort_code     int         default 0                    not null comment '排序',
    creator_id    bigint                                   null comment '添加人主键',
    creator_name  varchar(50)                              null comment '添加人',
    created_at    datetime(6) default CURRENT_TIMESTAMP(6) null comment '创建时间',
    modifier_id   bigint                                   null comment '修改人主键',
    modifier_name varchar(50)                              null comment '修改人',
    modifier_at   datetime(6) default CURRENT_TIMESTAMP(6) null on update CURRENT_TIMESTAMP(6) comment '修改时间',
    version       bigint                                   null comment '版本',
    is_removed    tinyint(1)  default 0                    not null comment '删除标记'
)
    comment '产品管理表' row_format = DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create table if not exists sys_role
(
    id            bigint                                    not null comment '角色ID'
        primary key,
    name          varchar(255)                              not null comment '角色名称',
    is_disabled   tinyint(1)   default 0                    not null comment '禁用',
    description   varchar(255)                              null comment '角色描述',
    creator_id    bigint                                    null comment '添加人主键',
    creator_name  varchar(50)                               null comment '添加人',
    created_at    timestamp(6) default CURRENT_TIMESTAMP(6) null comment '创建时间',
    modifier_id   bigint                                    null comment '修改人主键',
    modifier_name varchar(50)                               null comment '修改人',
    modifier_at   datetime(6)  default CURRENT_TIMESTAMP(6) null on update CURRENT_TIMESTAMP(6) comment '修改时间',
    version       bigint                                    null comment '版本',
    is_removed    tinyint(1)   default 0                    not null comment '删除标记'
)
    comment '角色管理表' row_format = DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create index name
    on sys_role (name);

create table if not exists sys_role_permission
(
    id            bigint                                   not null comment '主键id'
        primary key,
    role_id       bigint                                   not null comment '角色id',
    permission_id bigint                                   not null comment '权限项id',
    module_id     bigint                                   not null comment '权限项所在的模块id',
    creator_id    bigint                                   null comment '添加人主键',
    creator_name  varchar(50)                              null comment '添加人',
    created_at    datetime(6) default CURRENT_TIMESTAMP(6) null comment '创建时间',
    modifier_id   bigint                                   null comment '修改人主键',
    modifier_name varchar(50)                              null comment '修改人',
    modifier_at   datetime(6) default CURRENT_TIMESTAMP(6) null on update CURRENT_TIMESTAMP(6) comment '修改时间',
    version       bigint                                   null comment '版本',
    is_removed    tinyint(1)  default 0                    not null comment '删除标记'
)
    comment '角色-权限项关联表' row_format = DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create table if not exists sys_user_role
(
    id            bigint                                    not null
        primary key,
    user_id       bigint                                    not null comment '用户ID',
    role_id       bigint                                    not null comment '角色ID',
    creator_id    bigint                                    null comment '添加人主键',
    creator_name  varchar(50)                               null comment '添加人',
    created_at    timestamp(6) default CURRENT_TIMESTAMP(6) not null comment '创建时间',
    modifier_id   bigint                                    null comment '修改人主键',
    modifier_name varchar(50)                               null comment '修改人',
    modifier_at   datetime(6)  default CURRENT_TIMESTAMP(6) null on update CURRENT_TIMESTAMP(6) comment '修改时间',
    version       bigint                                    null comment '版本',
    is_removed    tinyint(1)   default 0                    not null comment '删除标记'
)
    comment '用户角色关联表' row_format = DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

