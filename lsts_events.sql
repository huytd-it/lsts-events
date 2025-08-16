/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 90200 (9.2.0)
 Source Host           : localhost:3306
 Source Schema         : lsts_events

 Target Server Type    : MySQL
 Target Server Version : 90200 (9.2.0)
 File Encoding         : 65001

 Date: 15/08/2025 22:03:28
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(55) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `category_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `is_public` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  `deleted_at` datetime NULL DEFAULT NULL,
  `update_by` varchar(55) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `create_by` varchar(55) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `parent_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`category_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for category_user
-- ----------------------------
DROP TABLE IF EXISTS `category_user`;
CREATE TABLE `category_user`  (
  `category_user_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NULL DEFAULT NULL,
  `user_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`category_user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 83 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for event_media
-- ----------------------------
DROP TABLE IF EXISTS `event_media`;
CREATE TABLE `event_media`  (
  `media_id` int NOT NULL AUTO_INCREMENT,
  `order` int NULL DEFAULT 0,
  `media_name` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '',
  `file_path` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `event_id` int NOT NULL,
  `is_show` int NULL DEFAULT 1,
  `update_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `create_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`media_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2189 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for events
-- ----------------------------
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NULL DEFAULT NULL,
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `event_name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `event_date` date NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  `deleted_at` datetime NULL DEFAULT NULL,
  `update_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `create_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `order` int UNSIGNED NOT NULL DEFAULT 0,
  `is_big_event` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 252 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- View structure for category_leaves
-- ----------------------------
DROP VIEW IF EXISTS `category_leaves`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `category_leaves` AS select `category_tree`.`category_id` AS `category_id`,`category_tree`.`category_name` AS `category_name`,`category_tree`.`category_description` AS `category_description`,`category_tree`.`is_public` AS `is_public`,`category_tree`.`created_at` AS `created_at`,`category_tree`.`updated_at` AS `updated_at`,`category_tree`.`deleted_at` AS `deleted_at`,`category_tree`.`update_by` AS `update_by`,`category_tree`.`create_by` AS `create_by`,`category_tree`.`parent_id` AS `parent_id`,`category_tree`.`level` AS `level`,`category_tree`.`path` AS `path`,`category_tree`.`id_path` AS `id_path`,`category_tree`.`root_category` AS `root_category`,`category_tree`.`root_category_id` AS `root_category_id`,`category_tree`.`is_root` AS `is_root`,`category_tree`.`has_parent` AS `has_parent`,`category_tree`.`has_children` AS `has_children`,`category_tree`.`children_count` AS `children_count`,`category_tree`.`total_descendants` AS `total_descendants`,`category_tree`.`parent_name` AS `parent_name`,`category_tree`.`parent_description` AS `parent_description`,`category_tree`.`events_count` AS `events_count`,`category_tree`.`assigned_users_count` AS `assigned_users_count`,`category_tree`.`visibility_status` AS `visibility_status`,`category_tree`.`category_type` AS `category_type`,`category_tree`.`sort_id` AS `sort_id`,`category_tree`.`hierarchical_sort` AS `hierarchical_sort` from `category_tree` where (`category_tree`.`has_children` = 0) order by `category_tree`.`level` desc,`category_tree`.`category_name`;

-- ----------------------------
-- View structure for category_parents
-- ----------------------------
DROP VIEW IF EXISTS `category_parents`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `category_parents` AS select `category_tree`.`category_id` AS `category_id`,`category_tree`.`category_name` AS `category_name`,`category_tree`.`category_description` AS `category_description`,`category_tree`.`is_public` AS `is_public`,`category_tree`.`created_at` AS `created_at`,`category_tree`.`updated_at` AS `updated_at`,`category_tree`.`deleted_at` AS `deleted_at`,`category_tree`.`update_by` AS `update_by`,`category_tree`.`create_by` AS `create_by`,`category_tree`.`parent_id` AS `parent_id`,`category_tree`.`level` AS `level`,`category_tree`.`path` AS `path`,`category_tree`.`id_path` AS `id_path`,`category_tree`.`root_category` AS `root_category`,`category_tree`.`root_category_id` AS `root_category_id`,`category_tree`.`is_root` AS `is_root`,`category_tree`.`has_parent` AS `has_parent`,`category_tree`.`has_children` AS `has_children`,`category_tree`.`children_count` AS `children_count`,`category_tree`.`total_descendants` AS `total_descendants`,`category_tree`.`parent_name` AS `parent_name`,`category_tree`.`parent_description` AS `parent_description`,`category_tree`.`events_count` AS `events_count`,`category_tree`.`assigned_users_count` AS `assigned_users_count`,`category_tree`.`visibility_status` AS `visibility_status`,`category_tree`.`category_type` AS `category_type`,`category_tree`.`sort_id` AS `sort_id`,`category_tree`.`hierarchical_sort` AS `hierarchical_sort` from `category_tree` where (`category_tree`.`has_children` = 1) order by `category_tree`.`level`,`category_tree`.`category_name`;

-- ----------------------------
-- View structure for category_roots
-- ----------------------------
DROP VIEW IF EXISTS `category_roots`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `category_roots` AS select `category_tree`.`category_id` AS `category_id`,`category_tree`.`category_name` AS `category_name`,`category_tree`.`category_description` AS `category_description`,`category_tree`.`is_public` AS `is_public`,`category_tree`.`created_at` AS `created_at`,`category_tree`.`updated_at` AS `updated_at`,`category_tree`.`deleted_at` AS `deleted_at`,`category_tree`.`update_by` AS `update_by`,`category_tree`.`create_by` AS `create_by`,`category_tree`.`parent_id` AS `parent_id`,`category_tree`.`level` AS `level`,`category_tree`.`path` AS `path`,`category_tree`.`id_path` AS `id_path`,`category_tree`.`root_category` AS `root_category`,`category_tree`.`root_category_id` AS `root_category_id`,`category_tree`.`is_root` AS `is_root`,`category_tree`.`has_parent` AS `has_parent`,`category_tree`.`has_children` AS `has_children`,`category_tree`.`children_count` AS `children_count`,`category_tree`.`total_descendants` AS `total_descendants`,`category_tree`.`parent_name` AS `parent_name`,`category_tree`.`parent_description` AS `parent_description`,`category_tree`.`events_count` AS `events_count`,`category_tree`.`assigned_users_count` AS `assigned_users_count`,`category_tree`.`visibility_status` AS `visibility_status`,`category_tree`.`category_type` AS `category_type`,`category_tree`.`sort_id` AS `sort_id`,`category_tree`.`hierarchical_sort` AS `hierarchical_sort` from `category_tree` where (`category_tree`.`is_root` = 1) order by `category_tree`.`category_name`;

-- ----------------------------
-- View structure for category_tree
-- ----------------------------
DROP VIEW IF EXISTS `category_tree`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `category_tree` AS with recursive `category_hierarchy` as (select `c`.`category_id` AS `category_id`,`c`.`category_name` AS `category_name`,`c`.`category_description` AS `category_description`,`c`.`is_public` AS `is_public`,`c`.`created_at` AS `created_at`,`c`.`updated_at` AS `updated_at`,`c`.`deleted_at` AS `deleted_at`,`c`.`update_by` AS `update_by`,`c`.`create_by` AS `create_by`,`c`.`parent_id` AS `parent_id`,0 AS `level`,cast(`c`.`category_name` as char(1000) charset utf8mb4) AS `path`,cast(`c`.`category_id` as char(255) charset utf8mb4) AS `id_path`,`c`.`category_name` AS `root_category`,`c`.`category_id` AS `root_category_id`,1 AS `is_root`,0 AS `has_parent` from `categories` `c` where ((`c`.`parent_id` is null) and (`c`.`deleted_at` is null)) union all select `c`.`category_id` AS `category_id`,`c`.`category_name` AS `category_name`,`c`.`category_description` AS `category_description`,`c`.`is_public` AS `is_public`,`c`.`created_at` AS `created_at`,`c`.`updated_at` AS `updated_at`,`c`.`deleted_at` AS `deleted_at`,`c`.`update_by` AS `update_by`,`c`.`create_by` AS `create_by`,`c`.`parent_id` AS `parent_id`,(`ch`.`level` + 1) AS `level`,concat(`ch`.`path`,' > ',`c`.`category_name`) AS `path`,concat(`ch`.`id_path`,'/',`c`.`category_id`) AS `id_path`,`ch`.`root_category` AS `root_category`,`ch`.`root_category_id` AS `root_category_id`,0 AS `is_root`,1 AS `has_parent` from (`categories` `c` join `category_hierarchy` `ch` on((`c`.`parent_id` = `ch`.`category_id`))) where (`c`.`deleted_at` is null)) select `ct`.`category_id` AS `category_id`,`ct`.`category_name` AS `category_name`,`ct`.`category_description` AS `category_description`,`ct`.`is_public` AS `is_public`,`ct`.`created_at` AS `created_at`,`ct`.`updated_at` AS `updated_at`,`ct`.`deleted_at` AS `deleted_at`,`ct`.`update_by` AS `update_by`,`ct`.`create_by` AS `create_by`,`ct`.`parent_id` AS `parent_id`,`ct`.`level` AS `level`,`ct`.`path` AS `path`,`ct`.`id_path` AS `id_path`,`ct`.`root_category` AS `root_category`,`ct`.`root_category_id` AS `root_category_id`,`ct`.`is_root` AS `is_root`,`ct`.`has_parent` AS `has_parent`,(case when exists(select 1 from `categories` `sc` where ((`sc`.`parent_id` = `ct`.`category_id`) and (`sc`.`deleted_at` is null))) then 1 else 0 end) AS `has_children`,(select count(0) from `categories` `sc` where ((`sc`.`parent_id` = `ct`.`category_id`) and (`sc`.`deleted_at` is null))) AS `children_count`,(select count(0) from `categories` `sc` where ((find_in_set(`ct`.`category_id`,replace((select group_concat(`ancestor`.`category_id` order by `ancestor`.`category_id` ASC separator ',') from `categories` `ancestor` where (find_in_set(`ancestor`.`category_id`,replace(concat('/',(select group_concat(`s`.`category_id` order by `s`.`category_id` ASC separator '/') from `categories` `s` where ((`s`.`category_id` = `sc`.`parent_id`) or (find_in_set(`s`.`parent_id`,replace(concat('/',`sc`.`parent_id`),'/',',')) > 0)))),'/',',')) > 0)),',',',,')) > 0) and (`sc`.`deleted_at` is null))) AS `total_descendants`,`p`.`category_name` AS `parent_name`,`p`.`category_description` AS `parent_description`,coalesce(`ec`.`event_count`,0) AS `events_count`,coalesce(`uc`.`user_count`,0) AS `assigned_users_count`,(case when (`ct`.`is_public` = 1) then 'Public' else 'Private' end) AS `visibility_status`,(case when (`ct`.`level` = 0) then 'Root Category' when (`ct`.`level` = 1) then 'Main Category' when (`ct`.`level` = 2) then 'Sub Category' else concat('Level ',`ct`.`level`,' Category') end) AS `category_type`,lpad(`ct`.`category_id`,10,'0') AS `sort_id`,concat(lpad(coalesce(`ct`.`root_category_id`,0),5,'0'),'_',lpad(`ct`.`level`,3,'0'),'_',lpad(`ct`.`category_id`,10,'0')) AS `hierarchical_sort` from (((`category_hierarchy` `ct` left join `categories` `p` on((`ct`.`parent_id` = `p`.`category_id`))) left join (select `events`.`category_id` AS `category_id`,count(0) AS `event_count` from `events` where (`events`.`deleted_at` is null) group by `events`.`category_id`) `ec` on((`ct`.`category_id` = `ec`.`category_id`))) left join (select `category_user`.`category_id` AS `category_id`,count(distinct `category_user`.`user_email`) AS `user_count` from `category_user` group by `category_user`.`category_id`) `uc` on((`ct`.`category_id` = `uc`.`category_id`))) order by `ct`.`root_category_id`,`ct`.`level`,`ct`.`category_name`;

-- ----------------------------
-- View structure for public_category_tree
-- ----------------------------
DROP VIEW IF EXISTS `public_category_tree`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `public_category_tree` AS select `category_tree`.`category_id` AS `category_id`,`category_tree`.`category_name` AS `category_name`,`category_tree`.`category_description` AS `category_description`,`category_tree`.`is_public` AS `is_public`,`category_tree`.`created_at` AS `created_at`,`category_tree`.`updated_at` AS `updated_at`,`category_tree`.`deleted_at` AS `deleted_at`,`category_tree`.`update_by` AS `update_by`,`category_tree`.`create_by` AS `create_by`,`category_tree`.`parent_id` AS `parent_id`,`category_tree`.`level` AS `level`,`category_tree`.`path` AS `path`,`category_tree`.`id_path` AS `id_path`,`category_tree`.`root_category` AS `root_category`,`category_tree`.`root_category_id` AS `root_category_id`,`category_tree`.`is_root` AS `is_root`,`category_tree`.`has_parent` AS `has_parent`,`category_tree`.`has_children` AS `has_children`,`category_tree`.`children_count` AS `children_count`,`category_tree`.`total_descendants` AS `total_descendants`,`category_tree`.`parent_name` AS `parent_name`,`category_tree`.`parent_description` AS `parent_description`,`category_tree`.`events_count` AS `events_count`,`category_tree`.`assigned_users_count` AS `assigned_users_count`,`category_tree`.`visibility_status` AS `visibility_status`,`category_tree`.`category_type` AS `category_type`,`category_tree`.`sort_id` AS `sort_id`,`category_tree`.`hierarchical_sort` AS `hierarchical_sort` from `category_tree` where (`category_tree`.`is_public` = 1) order by `category_tree`.`hierarchical_sort`;

SET FOREIGN_KEY_CHECKS = 1;
