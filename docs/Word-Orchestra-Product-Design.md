# WORD ORCHESTRA

**Product Strategy, Learning Design & MVP Specification**  
Version 1.0  |  2026-11-17  |  Product proposal  
*Every word becomes music.*

## 执行摘要

产品定位：一款把英语词汇学习、键盘输入和生成式音乐整合在一起的学习产品。用户通过复制、主动回忆、听音拼写和语境填空完成英语任务；每个字母产生即时音符，每个单词形成音乐动机，每句话形成乐句，整次练习生成一段可回放的个人作品。

与 Piano Typing 的根本区别：Word Orchestra 的输入内容由学习目标驱动，学习效果以延迟回忆、意义理解和语境应用衡量；音乐是动机与反馈层，不是学习结果本身。

产品原则：让用户愿意继续，但不以沉迷、焦虑或惩罚为目标；用自主性、胜任感、清晰反馈和真实知识增长构建长期参与。

## 1. 产品定义与差异化

### 核心承诺
- 用户每完成一个英语单词，就获得一个可感知的音乐片段；每完成一个短语或句子，音乐逐步形成更完整的乐句；每次 session 结束，用户得到一段属于自己的作品，同时获得可验证的英语学习记录。

### 目标用户
- 英语 A1–B2 学习者；希望通过键盘输入提升拼写与盲打的人；偏好音乐化、低压力学习环境的人；希望从自选文本、兴趣主题或工作资料中提取词汇的人。

### 主要 Job-to-be-Done
- 当我学习英语单词时，我希望练习不再像重复刷卡，而是通过有声音、有作品感的输入流程，持续完成有意义的主动回忆，并能看到一周后我是否还记得。

### 与 Piano Typing 的边界
- Piano Typing 是自由输入的音乐乐器；Word Orchestra 是学习驱动的英语练习系统。两者可以共享底层键盘事件与音乐播放内核，但不能共享单一评分逻辑、任务调度或数据模型。

## 2. 市场证据与机会

### Product Hunt 信号
- Atomic Learning 将 Listen → Type → Learn 做成每日英语听写挑战，验证听力与键盘输入的结合有清晰理解门槛；TapNoise 与 Switch Lab 体现按键声音和输入游戏的吸引力；Ratatype 代表系统化盲打训练。

### Hacker News 信号
- 打字游戏讨论中，用户偏好真实词语/句子、可理解的错误反馈和合理难度曲线；长文本重打讨论显示自选文章、阅读与输入结合有吸引力；Duolingo 相关讨论提醒 streak 和积分可能替代真正的学习目标。社区评论是定性线索，不应当作市场规模或因果证据。

### 产品机会
- 将主动回忆、听音拼写、语境练习、键盘训练与受控音乐生成组合成一个闭环。差异化不在“加一层积分”，而在“学习动作本身生成音乐，并把音乐作品与知识掌握绑定”。

## 3. 学习科学与设计约束

### 主动提取与间隔练习
- 学习流程必须包含不看答案的主动回忆，并把复习分散到不同时间。复制输入只训练视觉—动作映射和拼写熟练度，不应直接计为词汇掌握。二语间隔练习元分析显示 spacing 对学习有中到大的总体效应；词汇活动元分析也显示即时收益会在延迟测验中下降。

### 多维掌握
- 每个词至少区分 form recall（词形/拼写）、meaning recall（词义回忆）、listening recognition（听辨）、contextual use（语境使用）。一个方向的成功不能推断其他方向都已掌握。

### 音乐的角色
- 音乐是即时反馈、审美奖励和作品记忆线索；不要声称背景音乐必然提高英语记忆。研究显示背景音乐对认知任务的影响取决于任务难度、音乐类型和个体差异；音乐训练与语言加工的关联也不能直接外推为本产品的教学效果。

### 动机设计
- 采用自我决定理论：自主性（选词库/音色/时长）、胜任感（可见的能力进步）、归属感（自愿分享作品/好友合奏）。心流设计强调挑战—技能匹配、明确目标和及时反馈；不要把无限连胜、损失厌恶或随机奖励作为核心。

## 4. 核心学习玩法

### 模式一：Copy
- 屏幕展示目标单词，用户照着输入。用途：熟悉拼写、键盘动作与发音；奖励主要计入 typing practice，不计为强掌握。

### 模式二：Recall
- 显示中文释义或英文定义，用户主动回忆并输入单词。输入正确后才进入词汇回忆记录；若使用提示，应降低本次回忆等级而不是惩罚用户。

### 模式三：Listen
- 播放自然发音，用户听音拼写。需要区分英美发音、语速和重播次数；重播可作为提示事件记录。

### 模式四：Context
- 给出句子和语义上下文，用户完成空缺词或输入目标短语。应确保句子语法自然、目标答案唯一或可接受答案明确。

### 模式五：Compose
- 给出表达意图或主题，用户输入自己的短句。MVP 仅做简单的词汇使用记录；复杂语法评分与自由写作反馈放到后续阶段。

### 学习路径
- 新词先 Copy/Listen 建立形式与声音联结，再 Recall 进行主动提取，随后 Context 检验语境应用，最后在间隔复习中检验保持。用户可跳过不适合自己的步骤。

## 5. 音乐与作曲机制

### 三级音乐结构
- 字母：即时短音符；单词：一个可识别的音乐动机；短语/句子：完整乐句；session：可回放的作品。每个层级都需要听感连贯，且输入错误不应毁掉整段音乐。

### 键位到音符
- 基础键位决定稳定的音高类别，使用五声音阶作为默认入门；当前和弦决定伴奏与和声背景。不要让相同按键在每次和弦变化时完全随机改变音高，否则会破坏键位一致性。

### 词汇到动机
- 同一词条在同一音乐 preset 下应尽可能生成可复现的动机，方便用户建立听觉识别；可用词条 ID + preset + key 生成确定性 seed。词长只作为结构参数之一，音节数与重音应优先来自词典/发音数据，不能简单把字母数等同音节。

### 句子到乐句
- 空格形成词间呼吸；逗号形成短停顿；句号/问号/感叹号形成乐句结束；语速影响节奏密度但不要求用户追拍。音乐引擎根据调性和和弦进行做轻量编排。

### 学习阶段音频策略
- Recall/Listen 等高认知负荷任务使用稀疏伴奏或只保留按键音；Copy/自由练习可开启丰富伴奏；完成一组后播放完整作品。允许随时静音、调低伴奏或只保留钢琴。

## 6. 得分、反馈与进度模型

### 不做单一总分
- 分开呈现 Language Mastery、Typing Skill 和 Music Creation。音乐表现以作品完整度/用户偏好描述，不由系统判定审美高低。输入快不等于词汇掌握。

### 语言掌握维度
- Form Recall：不看提示正确拼写；Meaning Recall：根据英文/中文提示回忆词义或词形；Listening：听辨并拼写；Context：在新语境中正确使用。掌握状态需要多次、跨时间、跨方向证据。

### 建议的初始分数权重
- 如果必须提供 session 指标，可先用 Meaning Recall 30%、Form Recall 30%、Context Use 25%、Listening 15% 形成“本次学习表现”摘要；该权重只是产品假设，不能直接作为长期 mastery 算法。长期调度使用每个练习方向独立的复习记录。

### 即时反馈
- 正确字符播放和弦内音符；错误字符使用柔和提示并保留纠错路径；完成单词形成动机；完成句子形成乐句；成功主动回忆时显示词义、发音、搭配或例句。不要用刺耳音效、扣生命或倒计时压迫回忆。

### 长期反馈
- 显示本次新词、主动回忆成功、待复习词、7/30 天延迟回忆、常见拼写错误和键盘进步。streak 可作为轻量日历，不允许断签导致已有学习成果损失。

## 7. 自适应学习与复习算法

### 双能力画像
- Language Profile：词形回忆、词义回忆、听辨、语境使用；Typing Profile：字符准确率、常见 bigram 延迟、错误键位和个人速度基线。系统一次只提高一个主要挑战维度。

### 复习调度
- 每个可独立回忆的词义/词形方向维护复习记录。可采用 FSRS 的 Difficulty、Stability、Retrievability 概念预测复习时机；每次有效的主动提取任务才形成 review event，连续复制输入不应被当成多次独立记忆复习。

### 评分输入
- 正确、困难、错误/忘记、使用提示、音频重播、答案揭示等作为调度器输入。不要把反应时间作为主要记忆成绩；用户需要时间思考是正常学习过程。

### 自适应决策
- 英语难但打字熟练：放慢任务节奏、提供简单键盘路径；英语熟练但键盘薄弱：选择短词与薄弱组合；两者都熟练：增加短语、句子与较复杂表达；两者都较弱：短 session、低密度伴奏、少量高频词。

### 内容排序
- 结合复习到期、词频、CEFR、个人错误、兴趣主题和新旧词比例。不得只按用户点击/停留时间推荐内容。

## 8. 内容质量与数据模型

### 词条字段
- lemma、surface_form、sense_id、CEFR、词频、词性、IPA、音频、中文释义、英文释义、例句、搭配、词根词缀、来源、授权/许可、审核状态。一个拼写可有多个 sense；不同 sense 应独立评估。

### 练习事件
- exercise_id、user_id、item_id、direction、prompt_type、answer_result、hint_count、audio_replay_count、response_at、review_grade、scheduler_state_before/after、session_id。

### 音乐事件
- key_code、character token（仅限练习内容且默认不持久化）、event timestamp、note_id、velocity proxy、duration、preset、chord context、motif_id、composition_id。物理键盘通常无法提供真实力度 velocity，不能伪造触键力度数据。

### 隐私与安全
- 默认只在练习上下文内处理输入；不进行系统级键盘监听；不记录用户其他应用输入；原始答案与导入文本本地优先保存；云同步必须明确告知；可删除词汇历史和作品；不把学习文本发送给 LLM，除非用户明确启用 AI 功能。

### 内容可靠性
- LLM 可生成练习候选，但词义、音标、例句和可接受答案需词典/语料校验或人工审核；避免 AI 生成错误搭配、虚构发音和有歧义的填空题。

## 9. MVP 需求与验收标准

### P0
- 英语 A1–B1 小型高质量词库；Copy 与 Recall 两种模式；词义/音标/例句；字母即时音符；单词动机和句子乐句；Felt Piano 一个高质量 preset + 两个简化 preset；本地学习历史；纠错；session 作品回放。

### P0 验收
- Copy 与 Recall 记录严格区分；同一个单词复制输入不会提升长期 mastery；正确答案、提示、错误和重试记录可追溯；复习事件可按方向保存；音符与键盘输入同步；错误修正不会使 session 崩溃；静音和暂停有效；默认不上传原始文本。

### P1
- Listen 模式、Context 模式、FSRS 复习调度、词汇导入、键盘弱点画像、7/30 天延迟测验、作品收藏。

### P2
- AI 主题词库、用户文章提词、句子生成与校验、作品分享、好友合奏、多语言扩展。

## 10. 产品指标与验证实验

### 北极星指标
- Retained Vocabulary per 10 Minutes：每 10 分钟练习后，在 7 天/30 天无提示测试中仍能正确回忆的词义/词形单元数。必须同时报告测试覆盖率和置信区间，避免只挑成功用户。

### 学习效果指标
- 7-day delayed recall、30-day delayed recall、form/meaning recall 分开统计、context transfer、错误类型变化。用未练习过的例句测语境迁移，避免重复题记忆造成虚高。

### 产品体验指标
- 主动回访、session 完成率、音乐关闭率、平均 session、用户自评愉悦度、任务难度自评、退出原因。使用时长只是辅助指标。

### 核心实验
- 音乐反馈：每字母音符 vs. 仅单词完成音乐；学习负荷：稀疏伴奏 vs. 丰富伴奏；学习方式：Copy vs. Recall；复习：集中重复 vs. 间隔调度；自适应：固定难度 vs. 一次只调节一个维度。

### 初期研究设计
- 10–20 名探索用户用于发现交互问题；随后开展随机分组、预注册主要指标的试验。至少包含基线测验、即时后测、7 天延迟测验；条件允许时加入 30 天延迟测验。小样本可用于可用性和方向性信号，不可宣称统计学有效。

## 11. 路线图与风险控制

### Phase 0 — 音乐交互原型
- 先验证按键→音符→单词动机的音乐可听性和延迟；不急于接入 AI 或庞大词库。

### Phase 1 — 学习 MVP
- 上线 Copy/Recall、精选词库、中文释义、音标、例句、三维进度和作品回放。

### Phase 2 — 复习与听力
- 加入 Listen、Context、FSRS 调度、延迟测验和双能力画像。

### Phase 3 — 个性化内容
- 用户导入文本、主题词库、兴趣内容、AI 生成候选与质量审核。

### Phase 4 — 创作与社交
- 作品收藏、分享、协作演奏、学习小组；社交比较必须可关闭。

### 风险控制
- 音乐可能干扰语义编码；Copy 被误判为掌握；AI 内容错误；复习算法黑箱；键盘布局差异；为音乐追求速度而降低拼写质量；游戏化目标替代学习目标。

## 附录 A. 关键术语

### 掌握单元
- 建议以“词义 sense × 回忆方向”作为复习单元，而不是只用一个 word string。

### 延迟回忆
- 在首次学习后经过预设时间，无提示检验记忆；不以 session 内重复正确替代。

### 音乐动机
- 一个短小、可重复识别的音型；同一词条在相同 preset 下尽量可复现。

### 音乐奖励预测
- 利用和弦预期、旋律解决与结构变化提供审美反馈；不采用操纵性随机奖励。

## 参考资料与调研来源

资料访问日期：2026-11-17。产品页面与社区评论用于定性观察；学术文献用于设计约束，不构成对本产品效果的证明。

1. [Product Hunt — Switch Lab](https://www.producthunt.com/products/switch-lab) — 键盘声音、打字练习和小游戏的组合；用于观察键盘输入娱乐化方向。
2. [Product Hunt — TapNoise](https://www.producthunt.com/products/tapnoise) — 每次按键声音、Song Mode、桌面陪伴角色；用于观察即时声反馈与轻量成长。
3. [Product Hunt — Mechvibes](https://www.producthunt.com/products/mechvibes) — 可定制按键声音和跨平台桌面工具；用于观察键盘声音体验的独立需求。
4. [Product Hunt — Atomic Learning](https://www.producthunt.com/products/atomic-learning) — Listen → Type → Learn 的每日英语听写体验；用于观察听力与输入结合。
5. [Product Hunt — Ratatype](https://www.producthunt.com/products/ratatype) — 结构化盲打课程、键盘布局和进度训练。
6. [Hacker News — Show HN: I made a game to improve my typing speed](https://news.ycombinator.com/item?id=38879051) — 用户讨论真实文本、自然空格、错误提示、声音控制、难度曲线和手部疲劳。
7. [Hacker News — Retype entire novels](https://news.ycombinator.com/item?id=24696658) — 用户反馈有意义的长文本、导入自选文本、进度记录和指法提示的价值。
8. [Hacker News — Duolingo gamification discussion](https://news.ycombinator.com/item?id=44100035) — 评论提醒 streak 与积分可能替代真实学习目标；属于社区个案，不代表总体用户研究。
9. [Gold et al. (2019), PNAS — Musical reward prediction errors engage the nucleus accumbens and motivate learning](https://pmc.ncbi.nlm.nih.gov/articles/PMC6386687/) — 音乐预期与结果偏差可作为奖励学习信号；不能据此声称产品能制造成瘾。
10. [Li, Hew & Du (2024) — Gamification meta-analysis](https://link.springer.com/article/10.1007/s11423-023-10337-7) — 教育游戏化对内在动机、自主性和归属感有正向影响，但胜任感提升有限。
11. [Wang et al. (2024) — SDT-based educational interventions meta-analysis](https://www.sciencedirect.com/science/article/pii/S0023969024000572) — 自我决定理论干预与内在动机、自主性和胜任感改善相关。
12. [Fong et al. (2015) — Challenge–skill balance and flow meta-analysis](https://www.tandfonline.com/doi/full/10.1080/17439760.2014.967799) — 挑战—技能平衡、明确目标和控制感与心流相关。
13. [Carpenter, Pan & Butler (2022) — The science of effective learning with spacing and retrieval practice](https://www.nature.com/articles/s44159-022-00089-1) — 间隔学习与主动提取是可靠学习策略。
14. [Nakata et al. / Language Learning (2022) — Effects of spaced practice on second language learning](https://onlinelibrary.wiley.com/doi/full/10.1111/lang.12479) — 48 项实验、3,411 名参与者的元分析显示间隔练习对二语学习有中到大的效应。
15. [Webb, Yanagisawa & Uchihara (2020) — Intentional vocabulary-learning activities meta-analysis](https://onlinelibrary.wiley.com/doi/10.1111/modl.12671) — 词汇学习的即时收益在延迟测验中会下降，说明不能只用当场正确率代表掌握。
16. [Neves et al. (2022) — Music training and auditory/linguistic processing meta-analysis](https://pubmed.ncbi.nlm.nih.gov/35843347/) — 音乐训练与听觉/语言加工存在小幅正向关联，但不等同于按键伴奏能直接提高词汇记忆。
17. [Goltz & Sadakata (2021) — Do you listen to music while studying?](https://pubmed.ncbi.nlm.nih.gov/34555564/) — 背景音乐效果受任务难度、音乐类型和个体差异影响。
18. [W3C Web Audio API — Performance and latency](https://www.w3.org/TR/webaudio-1.1/) — 键盘事件到声音输出的延迟是交互音乐体验的关键工程变量。
19. [FSRS algorithm reference](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm) — FSRS 使用 Difficulty、Stability、Retrievability 估计复习时机。
