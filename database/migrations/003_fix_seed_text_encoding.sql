UPDATE users
SET display_name = 'ProjectM Super User',
    department = 'Admin',
    title = 'System Administrator'
WHERE user_id = 'USR_01JPM000000000000000001A';

UPDATE users
SET display_name = 'ProjectM Demo User',
    department = 'Operations',
    title = 'Employee'
WHERE user_id = 'USR_01JPM000000000000000002A';

UPDATE company_briefs
SET title = '今日公司简报',
    summary = '今日重点：上午系统维护提醒，下午新人培训，文档中心新增两份制度模板。',
    weather_note = '今日有阵雨，外出拜访同事请预留交通时间。',
    finance_one_liner = '财经一句话：市场关注本周主要经济数据发布，内部资讯仅作学习参考。',
    birthday_note = '生日提醒：祝本月生日同事工作顺利，天天开心。'
WHERE brief_id = 'BRF_01JPM000000000000000001A';

UPDATE announcements
SET title = 'ProjectM database environment is ready',
    summary = 'Initial Docker and PostgreSQL environment for ProjectM.',
    content_body = 'This seed announcement confirms that the ProjectM PostgreSQL schema can be initialized through Docker Compose.'
WHERE announcement_id = 'ANN_01JPM000000000000000000A';

UPDATE announcements
SET title = '端午节假期与调休安排',
    summary = '请各部门提前完成节前工作交接，并确认值班联系人。',
    content_body = '端午节期间请留意办公区开放时间。需要加班或使用会议室的同事，请提前向行政登记。'
WHERE announcement_id = 'ANN_01JPM000000000000000001A';

UPDATE announcements
SET title = '办公区空调维护通知',
    summary = '本周五 19:00 后将进行办公区空调例行维护。',
    content_body = '维护期间部分区域温度可能不稳定，请需要留办公室的同事提前安排座位。'
WHERE announcement_id = 'ANN_01JPM000000000000000002A';

UPDATE forum_posts
SET title = '大家最近最常用的效率工具是什么？',
    content_body = '本周讨论话题：分享一个你觉得能减少重复工作的工具或方法。'
WHERE forum_post_id = 'FPO_01JPM000000000000000001A';

UPDATE forum_posts
SET title = '新人入职第一周最容易遗漏的事项',
    content_body = '整理了几条新人同事经常问的问题，欢迎大家继续补充。'
WHERE forum_post_id = 'FPO_01JPM000000000000000002A';

UPDATE newcomer_resources
SET title = '新人入职第一天指南',
    summary = '账号、门禁、工位、沟通群和常用系统的第一天清单。',
    newcomer_content = '请先确认公司邮箱、即时通讯、VPN、考勤系统和文档中心权限是否可用。'
WHERE newcomer_resource_id = 'NWR_01JPM000000000000000001A';

UPDATE newcomer_resources
SET title = '办公区地图与会议室说明',
    summary = '快速找到会议室、茶水间、打印区和行政支持位置。',
    newcomer_content = '会议室使用前请在日历系统预订；临时会议优先选择开放协作区。'
WHERE newcomer_resource_id = 'NWR_01JPM000000000000000002A';

UPDATE finance_news
SET title = '财经早知道：本周重点经济日历',
    tag_names_json = '["市场", "财经日历"]'::jsonb,
    summary = '整理本周主要公开经济数据发布日期，供员工了解市场信息节奏。',
    content_body = '本文仅作财经知识与公开信息学习参考，不作为任何行动依据或结果承诺。'
WHERE finance_news_id = 'FIN_01JPM000000000000000001A';

UPDATE finance_news
SET title = '金融小知识：什么是基准利率',
    tag_names_json = '["金融小知识", "政策"]'::jsonb,
    summary = '用通俗语言解释基准利率及其对企业融资环境的影响。',
    content_body = '基准利率通常被市场用作观察融资成本变化的参考指标。本文只做概念介绍。'
WHERE finance_news_id = 'FIN_01JPM000000000000000002A';

UPDATE documents
SET title = '员工报销流程模板',
    summary = '说明常见报销类型、提交材料和审批路径。',
    document_content = '适用于差旅、办公采购和业务招待等常见报销场景。'
WHERE document_id = 'DOC_01JPM000000000000000001A';

UPDATE documents
SET title = '会议室使用规范',
    summary = '会议室预订、释放和设备使用说明。',
    document_content = '请按需预订会议室，并在会议结束后关闭屏幕和灯光。'
WHERE document_id = 'DOC_01JPM000000000000000002A';

UPDATE training_courses
SET title = '信息安全入门培训',
    summary = '账号安全、钓鱼邮件识别和资料保护基础课程。',
    course_content = '课程包含密码管理、双因素认证、敏感资料处理和常见攻击识别。'
WHERE course_id = 'TRN_01JPM000000000000000001A';

UPDATE training_courses
SET title = '新人系统使用培训',
    summary = '介绍公司常用系统入口、权限申请和支持渠道。',
    course_content = '适合入职一周内的新同事完成，用于熟悉日常协作系统。'
WHERE course_id = 'TRN_01JPM000000000000000002A';
