-- MySQL dump 10.13  Distrib 8.0.12, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sys_platform
-- ------------------------------------------------------
-- Server version	8.0.12

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `sys_module`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sys_module` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '模块id',
  `code` varchar(100) COLLATE utf8mb4_bin NOT NULL COMMENT '模块编码',
  `name` varchar(50) COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '模块名称',
  `app_type` varchar(10) COLLATE utf8mb4_bin NOT NULL DEFAULT 'web' COMMENT 'mobile移动端，web pc',
  `module_type` varchar(20) COLLATE utf8mb4_bin NOT NULL COMMENT 'url外部 / internal 一般页面',
  `url` varchar(1000) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '模块地址',
  `product_id` bigint(20) NOT NULL COMMENT '关联产品id',
  `parent_id` bigint(20) NOT NULL COMMENT '上级模块id',
  `icon` varchar(125) COLLATE utf8mb4_bin NOT NULL COMMENT '菜单图标',
  `sort_num` bigint(20) NOT NULL DEFAULT '0' COMMENT '菜单顺序',
  `is_disabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '禁用',
  `is_visible` tinyint(1) NOT NULL DEFAULT '0' COMMENT '隐藏标识',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '产品默认菜单',
  `group` varchar(125) COLLATE utf8mb4_bin NOT NULL COMMENT '模块分组',
  `creator_id` bigint(20) DEFAULT NULL COMMENT '添加人主键',
  `creator_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '添加人',
  `modifier_id` bigint(20) DEFAULT NULL COMMENT '修改人主键',
  `modifier_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '修改人',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL COMMENT '修改时间',
  `version` bigint(20) DEFAULT NULL COMMENT '版本',
  `is_removed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标记',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='模块管理表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_module`
--

LOCK TABLES `sys_module` WRITE;
INSERT INTO `sys_module` VALUES (1,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(2,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(3,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(4,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(5,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(6,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(7,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(8,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(9,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(10,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(11,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(12,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(13,'xxx','测试模块','pc','internal','/a/b/c',1,-1,'Car',1,0,0,0,'门户',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0);
UNLOCK TABLES;

--
-- Table structure for table `sys_operate_log`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sys_operate_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `operator_id` bigint(20) NOT NULL COMMENT '操作人员ID',
  `operator_name` varchar(125) COLLATE utf8mb4_bin NOT NULL COMMENT '操作人员ID',
  `type` varchar(125) COLLATE utf8mb4_bin NOT NULL COMMENT '日志类型',
  `operation` varchar(125) COLLATE utf8mb4_bin NOT NULL COMMENT '操作类型',
  `params` text COLLATE utf8mb4_bin NOT NULL COMMENT '参数',
  `details` text COLLATE utf8mb4_bin NOT NULL COMMENT '操作详情记录',
  `last_value` text COLLATE utf8mb4_bin NOT NULL COMMENT '修改前记录',
  `new_value` text COLLATE utf8mb4_bin NOT NULL COMMENT '修改后记录',
  `creator_id` bigint(20) DEFAULT NULL COMMENT '添加人主键',
  `creator_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '添加人',
  `modifier_id` bigint(20) DEFAULT NULL COMMENT '修改人主键',
  `modifier_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '修改人',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL COMMENT '修改时间',
  `version` bigint(20) DEFAULT NULL COMMENT '版本',
  `is_removed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标记',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='用户操作日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_operate_log`
--

LOCK TABLES `sys_operate_log` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `sys_permission`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sys_permission` (
  `id` bigint(20) NOT NULL COMMENT '权限项ID',
  `name` varchar(125) COLLATE utf8mb4_bin NOT NULL COMMENT '权限名称',
  `code` varchar(255) COLLATE utf8mb4_bin NOT NULL COMMENT '产品编码',
  `module_id` bigint(20) NOT NULL COMMENT '关联模块ID',
  `creator_id` bigint(20) DEFAULT NULL COMMENT '添加人主键',
  `creator_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '添加人',
  `modifier_id` bigint(20) DEFAULT NULL COMMENT '修改人主键',
  `modifier_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '修改人',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL COMMENT '修改时间',
  `version` bigint(20) DEFAULT NULL COMMENT '版本',
  `is_removed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标记',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='权限项管理表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_permission`
--

LOCK TABLES `sys_permission` WRITE;
INSERT INTO `sys_permission` VALUES (1,'查看权限','view-code',22,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0);
UNLOCK TABLES;

--
-- Table structure for table `sys_product`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sys_product` (
  `id` bigint(20) NOT NULL COMMENT '产品ID',
  `name` varchar(50) COLLATE utf8mb4_bin NOT NULL COMMENT '产品名称',
  `code` varchar(50) COLLATE utf8mb4_bin NOT NULL COMMENT '产品编码',
  `is_disabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '禁用,禁用后产品无法被用户使用',
  `icon` varchar(125) COLLATE utf8mb4_bin NOT NULL COMMENT '产品图标',
  `creator_id` bigint(20) DEFAULT NULL COMMENT '添加人主键',
  `creator_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '添加人',
  `modifier_id` bigint(20) DEFAULT NULL COMMENT '修改人主键',
  `modifier_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '修改人',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL COMMENT '修改时间',
  `version` bigint(20) DEFAULT NULL COMMENT '版本',
  `is_removed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标记',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='产品管理表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_product`
--

LOCK TABLES `sys_product` WRITE;
INSERT INTO `sys_product` VALUES (1,'测试系统','test-product',0,'a',NULL,NULL,NULL,NULL,'2025-03-04 17:09:30','2025-03-04 17:09:34',NULL,0),(2,'测试产品','est-product',0,'xs',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(11,'运营管理系统','op-product',0,'\'\'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(12,'协同管理系统','cm-product',0,'\'\'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(13,'后台管理系统','sys-product',0,'\'\'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(14,'元数据管理系统','pm-product',0,'\'\'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0);
UNLOCK TABLES;

--
-- Table structure for table `sys_role`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sys_role` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` varchar(50) COLLATE utf8mb4_bin NOT NULL COMMENT '角色名称',
  `is_disabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '禁用',
  `creator_id` bigint(20) DEFAULT NULL COMMENT '添加人主键',
  `creator_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '添加人',
  `modifier_id` bigint(20) DEFAULT NULL COMMENT '修改人主键',
  `modifier_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '修改人',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL COMMENT '修改时间',
  `version` bigint(20) DEFAULT NULL COMMENT '版本',
  `is_removed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标记',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='角色管理表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role`
--

LOCK TABLES `sys_role` WRITE;
INSERT INTO `sys_role` VALUES (1,'研发',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(3,'测试',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(4,'研发权限角色',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0);
UNLOCK TABLES;

--
-- Table structure for table `sys_role_permission`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sys_role_permission` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `role_id` bigint(20) NOT NULL COMMENT '角色id',
  `permission_id` bigint(20) NOT NULL COMMENT '权限项id',
  `module_id` bigint(20) NOT NULL COMMENT '权限项所在的模块id',
  `creator_id` bigint(20) DEFAULT NULL COMMENT '添加人主键',
  `creator_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '添加人',
  `modifier_id` bigint(20) DEFAULT NULL COMMENT '修改人主键',
  `modifier_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '修改人',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL COMMENT '修改时间',
  `version` bigint(20) DEFAULT NULL COMMENT '版本',
  `is_removed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标记',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='角色-权限项关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role_permission`
--

LOCK TABLES `sys_role_permission` WRITE;
INSERT INTO `sys_role_permission` VALUES (40,1,1,666,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),(41,1,2,444,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0);
UNLOCK TABLES;

--
-- Table structure for table `sys_role_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sys_role_user` (
  `id` bigint(20) NOT NULL,
  `operator_id` bigint(20) NOT NULL COMMENT '用户ID',
  `role_id` bigint(20) DEFAULT NULL COMMENT '角色ID',
  `creator_id` bigint(20) DEFAULT NULL COMMENT '添加人主键',
  `creator_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '添加人',
  `modifier_id` bigint(20) DEFAULT NULL COMMENT '修改人主键',
  `modifier_name` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '修改人',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL COMMENT '修改时间',
  `version` bigint(20) DEFAULT NULL COMMENT '版本',
  `is_removed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标记',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='用户角色关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role_user`
--

LOCK TABLES `sys_role_user` WRITE;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-06 18:55:35
