-- 命名空间表迁移
INSERT INTO conf_namespace (id,name,code,remark,version,is_removed, modifier_name,modifier_id,modifier_at,creator_id,creator_name, created_at,old_id)
SELECT FLOOR(RAND() * 1000000000000) id,name,code,remark,version,is_removed, modifier_name,modifier_id, modified_at modifier_at,creator_id,creator_name, created_at, id old_id FROM hrl.conf_namespace;

SELECT * FROM conf_namespace;

-- 配置属性表迁移
INSERT INTO conf_attribute (
  id, namespace_id, name, code, is_tree, priority,
  att_value, created_at, creator_id, creator_name,
  modifier_at, modifier_id, modifier_name, is_removed,
  version, old_namespace_id, old_id
)
SELECT
  FLOOR(RAND() * 1000000000000) AS id,
  b.id AS namespace_id,
  a.name, a.code, a.is_tree, a.priority,
  a.att_value, a.created_at, a.creator_id, a.creator_name,
  a.modified_at AS modifier_at,
  a.modifier_id, a.modifier_name, a.is_removed,
  a.version,
  a.namespace_id AS old_namespace_id,
  a.id AS old_id
FROM hrl.conf_attribute a
INNER JOIN conf_namespace b
ON a.namespace_id = b.old_id;

SELECT * FROM conf_attribute;

-- 配置类别表迁移
INSERT INTO conf_category (
created_at,creator_id,creator_name,modifier_at,modifier_id,modifier_name,is_removed,version,parent_id,old_parent_id,old_full_id,old_full_name,full_id,full_name,level,is_leaf,id,old_id,namespace_id,old_namespace_id,name,code,sort_code
)
select created_at,
       0 creator_id,
       creator_name,
       modified_at as modifier_at,
       0 modifier_id,
       modifier_name,
       is_removed,
       version,
       null parent_id,
       parent_id as old_parent_id,
       full_id as old_full_id,
       full_name as old_full_name,
       '' full_id,
       '' full_name,
       level,
       is_leaf,
       FLOOR(RAND() * 1000000000000) as id,
       a.id as old_id,
       b.id as namespace_id,
       namespace_id as old_namespace_id,
       name,
       code,
       sort_code
from hrl.conf_category a
INNER JOIN (SELECT id,old_id FROM conf_namespace) b
ON a.namespace_id = b.old_id;

SELECT id FROM conf_category GROUP BY id;

-- 配置类别表数据处理
select *
from conf_category
where level = 1;

update conf_category
set full_id  = id,
    parent_id= -1
where level = 1;

select *
from conf_category
where level = 2;

update
    conf_category as c
        join
        (select c1.id                                                 as c1_id,
                c1.old_id                                             as c1_old_id,
                c1.name,
                c2.id                                                 as c2_id,
                c2.old_id                                             as c2_old_id,
                c2.old_parent_id,
                c2.full_name,
                c2.old_full_name,
                c2.full_id,
                concat(cast(c1.id as char), "|", cast(c2.id as char)) as new_full_id,
                c1.id                                                 as parent_id
         from conf_category as c1
                  join conf_category as c2 on c1.old_id = c2.old_parent_id
         where c2.level = 2
           and c1.level = 1)
            as cc on c2_old_id = c.old_id
set c.full_id   = cc.new_full_id,
    c.parent_id = cc.parent_id
where c.is_removed = false
  and c.level = 2;

select * from conf_category where level = 3;

update
    conf_category as c
        join
        (select c1.id                                                 as c1_id,
                c1.old_id                                             as c1_old_id,
                c1.name,
                c2.id                                                 as c2_id,
                c2.old_id                                             as c2_old_id,
                c2.old_parent_id,
                c2.full_name,
                c2.old_full_name,
                c2.full_id,
                concat(cast(c1.full_id as char), "|", cast(c2.id as char)) as new_full_id,
                c1.id                                                 as parent_id
         from conf_category as c1
                  join conf_category as c2 on c1.old_id = c2.old_parent_id
         where c2.level = 3
           and c1.level = 2)
            as cc on c2_old_id = c.old_id
set c.full_id   = cc.new_full_id,
    c.parent_id = cc.parent_id
where c.is_removed = false
  and c.level = 3;

select * from conf_category where level = 4;

update
    conf_category as c
        join
        (select c1.id                                                 as c1_id,
                c1.old_id                                             as c1_old_id,
                c1.name,
                c2.id                                                 as c2_id,
                c2.old_id                                             as c2_old_id,
                c2.old_parent_id,
                c2.full_name,
                c2.old_full_name,
                c2.full_id,
                concat(cast(c1.full_id as char), "|", cast(c2.id as char)) as new_full_id,
                c1.id                                                 as parent_id
         from conf_category as c1
                  join conf_category as c2 on c1.old_id = c2.old_parent_id
         where c2.level = 4
           and c1.level = 3)
            as cc on c2_old_id = c.old_id
set c.full_id   = cc.new_full_id,
    c.parent_id = cc.parent_id
where c.is_removed = false
  and c.level = 4;

select * from conf_category where level = 5 and is_removed = FALSE;

update
    conf_category as c
        join
        (select c1.id                                                 as c1_id,
                c1.old_id                                             as c1_old_id,
                c1.name,
                c2.id                                                 as c2_id,
                c2.old_id                                             as c2_old_id,
                c2.old_parent_id,
                c2.full_name,
                c2.old_full_name,
                c2.full_id,
                concat(cast(c1.full_id as char), "|", cast(c2.id as char)) as new_full_id,
                c1.id                                                 as parent_id
         from conf_category as c1
                  join conf_category as c2 on c1.old_id = c2.old_parent_id
         where c2.level = 5
           and c1.level = 4)
            as cc on c2_old_id = c.old_id
set c.full_id   = cc.new_full_id,
    c.parent_id = cc.parent_id
where c.is_removed = false
  and c.level = 5;

select * from conf_category where level = 6 and is_removed = FALSE;

update
    conf_category as c
        join
        (select c1.id                                                 as c1_id,
                c1.old_id                                             as c1_old_id,
                c1.name,
                c2.id                                                 as c2_id,
                c2.old_id                                             as c2_old_id,
                c2.old_parent_id,
                c2.full_name,
                c2.old_full_name,
                c2.full_id,
                concat(cast(c1.full_id as char), "|", cast(c2.id as char)) as new_full_id,
                c1.id                                                 as parent_id
         from conf_category as c1
                  join conf_category as c2 on c1.old_id = c2.old_parent_id
         where c2.level = 6
           and c1.level = 5)
            as cc on c2_old_id = c.old_id
set c.full_id   = cc.new_full_id,
    c.parent_id = cc.parent_id
where c.is_removed = false
  and c.level = 6;

SELECT * FROM conf_category;

INSERT INTO conf_params (id,category_id,params_key,params_type,default_value,is_nest,is_enable,attribute_list,remark,config_ui,is_editable,content,is_user,is_admin,sort_code,is_read,created_at,creator_id,creator_name,modifier_at,modifier_id,modifier_name,is_removed,version,old_category_id,old_id)
SELECT FLOOR(RAND() * 1000000000000) as id,
			 b.id category_id,
			 params_key,
			 params_type,
			 default_value,
			 is_nest,
			 is_enable,
			 attribute_list,
			 remark,
			 config_ui,
			 is_editable,
			 content,
			 is_user,
			 is_admin,
			 sort_code,
			 is_read,
			 created_at,
			 creator_id,
			 creator_name,
			 modified_at as modifier_at,
			 modifier_id,
			 modifier_name,
			 is_removed,
			 version,
			 a.category_id as old_category_id,
			 a.id as old_id
			 FROM hrl.conf_params a
			 INNER JOIN (SELECT id,old_id FROM conf_category) b
			 on a.category_id = b.old_id;

SELECT * FROM conf_params;

SELECT * from hrl.conf_params_value;

-- 插入配置参数值
INSERT INTO conf_params_value (id,params_id,attribute_path,params_value,created_at,creator_id,creator_name,modifier_at,modifier_id,modifier_name,is_removed,version,old_id,old_params_id)
SELECT FLOOR(RAND() * 1000000000000) as id,
			 b.id params_id,
			 attribute_path,
			 params_value,
			 created_at,
			 creator_id,
			 creator_name,
			 modified_at as modifier_at,
			 modifier_id,
			 modifier_name,
			 is_removed,
			 version,
			 a.id as old_id,
			 params_id as old_params_id
			 FROM hrl.conf_params_value a
			 INNER JOIN (SELECT id,old_id FROM conf_params) b
			 on a.params_id = b.old_id;


-- 插入查询参数权限表
INSERT INTO conf_params_permission (id,params_id,attribute_path,is_editable,level,created_at,creator_id,creator_name,modifier_at,modifier_id,modifier_name,is_removed,version,old_id,old_params_id)
SELECT FLOOR(RAND() * 1000000000000) as id,
			 b.id params_id,
			 attribute_path,
			 is_editable,
			 level,
			 created_at,
			 creator_id,
			 creator_name,
			 modified_at as modifier_at,
			 modifier_id,
			 modifier_name,
			 is_removed,
			 version,
			 a.id as old_id,
			 params_id as old_params_id
			 FROM hrl.conf_params_permission a
			 INNER JOIN (SELECT id,old_id FROM conf_params) b
			 on a.params_id = b.old_id;





