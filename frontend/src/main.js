import { createApp } from "vue/dist/vue.esm-bundler.js";
import MarkdownIt from "markdown-it";
import katex from "katex";
import texmath from "markdown-it-texmath";
import "katex/dist/katex.min.css";
import "markdown-it-texmath/css/texmath.css";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const TOKEN_KEY = "stat_ai_bootcamp_token";
const markdown = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true
}).use(texmath, {
  engine: katex,
  delimiters: ["dollars", "brackets", "beg_end"],
  katexOptions: {
    throwOnError: false,
    strict: "ignore"
  }
});

const WEEKS = [
  {
    week: 1,
    title: "AI 总览 + Python 基础",
    stats: "描述性统计、均值、方差、分布、样本与总体",
    ai: "人工智能、机器学习、深度学习、大模型的基本关系；监督学习与无监督学习概念",
    task: "安装 Anaconda / Miniconda、VS Code、Jupyter、Git；完成 Python 变量、列表、字典、循环、函数、文件读写",
    output: "basic_statistics_calculator.py；3 道题解；1 篇笔记《AI、ML、DL、LLM 的区别》",
    leetcodeTheme: "数组与循环",
    leetcode: ["1 Two Sum", "283 Move Zeroes", "485 Max Consecutive Ones"]
  },
  {
    week: 2,
    title: "数据分析基础 + 可视化",
    stats: "数据清洗、缺失值、异常值、相关性、分组统计、抽样",
    ai: "数据集、特征、标签、训练数据、测试数据；数据质量对模型效果的影响",
    task: "学习 NumPy、pandas、matplotlib；完成 CSV/Excel 数据读取、清洗、统计描述、可视化；入门 SQLite 或 DuckDB 查询",
    output: "eda_analysis.ipynb；1 份数据探索报告；至少 3 张可视化图；4 道题解",
    leetcodeTheme: "字符串与哈希表",
    leetcode: ["242 Valid Anagram", "387 First Unique Character", "349 Intersection of Two Arrays", "13 Roman to Integer"]
  },
  {
    week: 3,
    title: "统计推断 + 线性回归",
    stats: "参数估计、最小二乘、最大似然、置信区间、残差分析",
    ai: "线性回归、损失函数、梯度下降、模型参数学习；理解机器学习三要素：模型、学习准则、优化算法",
    task: "用 Python 手写一元线性回归；用 statsmodels 做 OLS 回归；比较手写结果与库函数结果",
    output: "linear_regression_stats.ipynb；1 篇笔记《线性回归与机器学习的关系》；4 道题解",
    leetcodeTheme: "栈与队列",
    leetcode: ["20 Valid Parentheses", "232 Implement Queue using Stacks", "225 Implement Stack using Queues", "155 Min Stack"]
  },
  {
    week: 4,
    title: "分类模型 + 统计学习入门",
    stats: "Logistic 回归、混淆矩阵、准确率、精确率、召回率、F1、ROC-AUC",
    ai: "二分类、多分类、模型评价、过拟合、训练集/验证集/测试集、交叉验证",
    task: "用 sklearn 训练 Logistic Regression、KNN、Decision Tree、Random Forest；比较模型性能",
    output: "classification_baseline.ipynb；1 张模型指标比较表；1 篇模型评价分析；4 道题解",
    leetcodeTheme: "链表",
    leetcode: ["206 Reverse Linked List", "21 Merge Two Sorted Lists", "141 Linked List Cycle", "203 Remove Linked List Elements"]
  },
  {
    week: 5,
    title: "无监督学习 + 降维 + 大数据入门",
    stats: "PCA、聚类、距离度量、协方差矩阵、数据降维、密度估计",
    ai: "K-means、PCA、异常检测、特征工程；大数据中“抽样—建模—评估”的思维",
    task: "使用 PCA 对高维数据降维并可视化；使用 K-means 聚类；用 DuckDB / SQLite 处理较大表格数据；可选 PySpark 入门",
    output: "pca_clustering.ipynb；1 份聚类结果解释；1 个 SQL 数据查询练习；4 道题解",
    leetcodeTheme: "二分查找与递归",
    leetcode: ["704 Binary Search", "35 Search Insert Position", "69 Sqrt(x)", "509 Fibonacci Number"]
  },
  {
    week: 6,
    title: "深度学习 + PyTorch 入门",
    stats: "非线性函数拟合、优化、正则化、偏差-方差、泛化能力",
    ai: "神经元、前馈神经网络、激活函数、反向传播、自动梯度、过拟合与正则化",
    task: "学习 Tensor、Dataset、DataLoader、nn.Module、loss、optimizer；训练一个 MLP 分类器；比较神经网络与 Logistic 回归",
    output: "pytorch_mlp_classifier.ipynb；训练 loss 曲线；模型对比报告；4 道题解",
    leetcodeTheme: "二叉树基础",
    leetcode: ["94 Binary Tree Inorder Traversal", "104 Maximum Depth of Binary Tree", "226 Invert Binary Tree", "100 Same Tree"]
  },
  {
    week: 7,
    title: "NLP + Transformer + 大模型入门",
    stats: "文本数据统计、词频、TF-IDF、文本分类指标、模型输出不确定性",
    ai: "Token、Embedding、Attention、Transformer、BERT/GPT、Prompt、幻觉、RAG 基础",
    task: "用 TF-IDF + Logistic 回归做文本分类；用 Hugging Face pipeline 或 API 体验文本分类/摘要/问答；设计 10 条 prompt 并比较输出",
    output: "llm_text_analysis_demo.ipynb；10 条 prompt 测试记录；1 篇笔记《大模型输出为什么需要统计评估》",
    leetcodeTheme: "动态规划入门",
    leetcode: ["70 Climbing Stairs", "746 Min Cost Climbing Stairs", "198 House Robber", "121 Best Time to Buy and Sell Stock"]
  },
  {
    week: 8,
    title: "结课项目 + 汇报",
    stats: "建模流程、实验设计、指标选择、误差分析、可解释性、统计结论表达",
    ai: "综合使用 Python、统计分析、机器学习/深度学习/大模型完成一个 AI 小项目",
    task: "2-3 人一组完成项目：预测建模、文本分类、时间序列预测、LLM 数据分析助手、A/B 测试模拟等",
    output: "完整项目仓库、README、requirements、实验报告、5 分钟汇报 PPT；完成 28-32 道 LeetCode",
    leetcodeTheme: "综合复盘",
    leetcode: ["53 Maximum Subarray", "102 Binary Tree Level Order Traversal", "200 Number of Islands，可选", "复盘前 7 周错题"]
  }
];

WEEKS.forEach((week) => {
  week.tasks = [
    { key: "stats", title: "统计学重点", text: week.stats },
    { key: "ai", title: "AI / 机器学习重点", text: week.ai },
    { key: "lab", title: "Python / 实验任务", text: week.task },
    { key: "output", title: "周产出", text: week.output }
  ];
});

const GOALS = [
  ["编程基础", "能用 Python 完成数据读取、清洗、统计和可视化。"],
  ["统计建模", "能理解回归、分类、假设检验、交叉验证和模型评价。"],
  ["机器学习", "能用 sklearn 完成常见监督学习和无监督学习任务。"],
  ["深度学习", "能用 PyTorch 跑通简单神经网络训练流程。"],
  ["大模型应用", "能理解 Transformer / LLM 基本概念，能使用大模型辅助文本和数据分析。"],
  ["工程规范", "能使用 Git 管理代码，写 README 和实验报告。"],
  ["项目能力", "能完成一个“统计分析 + AI 建模”的小型可复现项目。"],
  ["统计表达", "能用指标、图表和文字说明模型结论、误差来源与局限性。"]
];

const PROJECTS = [
  ["表格数据预测建模", "数据清洗 → EDA → 线性/Logistic 回归 → 随机森林/XGBoost 可选 → 指标评估", "至少 1 个公开数据集；至少 3 个模型；至少 3 个评价指标；1 份误差分析", ["EDA", "Regression", "ML"]],
  ["时间序列预测", "时间序列可视化 → 移动平均 → ARIMA/Prophet 可选 → 机器学习预测", "至少 1 个时间序列数据集；训练/测试划分；预测曲线；MAE/RMSE", ["Time Series", "Forecasting"]],
  ["文本分类与统计分析", "文本清洗 → 词频统计 → TF-IDF → Logistic 回归/朴素贝叶斯 → LLM 对比", "至少 100 条文本；输出分类指标；比较传统模型与大模型输出", ["NLP", "TF-IDF", "LLM"]],
  ["A/B 测试与因果推断模拟", "随机实验模拟 → 假设检验 → 置信区间 → uplift 分析 → 可视化", "构造或使用公开实验数据；完成显著性检验；解释结论和局限性", ["A/B Test", "Causal"]],
  ["LLM 数据分析助手", "上传表格数据 → 设计 prompt → 让 LLM 生成分析思路 → Python 验证结果", "至少 1 个数据集；10 条 prompt 测试；指出 LLM 分析中的错误或幻觉", ["Prompt", "LLM", "Validation"]],
  ["降维与聚类分析", "标准化 → PCA/t-SNE 可选 → K-means/层次聚类 → 聚类解释", "至少 1 个多维数据集；降维图；聚类结果；解释不同簇的统计特征", ["PCA", "Clustering"]],
  ["推荐系统小实验", "用户-物品矩阵 → 相似度计算 → 协同过滤 → 推荐结果评估", "构造小型推荐数据；实现 Top-N 推荐；说明推荐结果是否合理", ["Recommender", "Similarity"]]
];

const ASSESSMENT = [
  ["Python 与数据处理", "20%", "能独立处理 CSV/Excel，完成基础统计和可视化", "能写结构清晰的 notebook，完成数据清洗、统计分析、图表解释"],
  ["统计建模能力", "20%", "理解线性回归、Logistic 回归、假设检验和基础指标", "能解释参数、残差、置信区间、偏差-方差和模型局限性"],
  ["机器学习实验", "20%", "能用 sklearn 完成训练、预测和评价", "能比较多个模型，使用交叉验证，并进行误差分析"],
  ["深度学习 / 大模型入门", "15%", "能跑通 PyTorch 或 Transformers 基础实验", "能解释模型训练流程、大模型输出风险和 prompt 设计原则"],
  ["LeetCode 基础", "15%", "完成 20 题以上，有代码和思路", "完成 30 题以上，有复杂度分析和错题复盘"],
  ["结课项目", "10%", "有可运行 Demo、README 和汇报", "项目可复现，有完整数据说明、模型比较、统计结论和局限性分析"]
];

createApp({
  data() {
    return {
      token: localStorage.getItem(TOKEN_KEY) || "",
      user: null,
      authMode: "login",
      authForm: { username: "", password: "", displayName: "" },
      view: "dashboard",
      loading: false,
      toast: "",
      dashboard: null,
      progress: { weeks: {}, tasks: {}, leetcode: {} },
      openWeeks: Object.fromEntries(WEEKS.map((week) => [week.week, true])),
      questions: [],
      quizzes: [],
      selectedQuizId: "",
      quizForm: { title: "", description: "" },
      selectedQuestionIds: [],
      submissions: [],
      mySubmissions: [],
      users: [],
      logs: [],
      logFiles: [],
      logFilter: { type: "", file: "", busy: false },
      databaseInfo: null,
      questionForm: { title: "", content: "", answer: "", image: null },
      questionImport: { file: null, busy: false },
      showImportHelp: false,
      answerDrafts: {},
      search: ""
    };
  },
  computed: {
    isAdmin() {
      return this.user?.role === "admin";
    },
    filteredWeeks() {
      const q = this.search.trim().toLowerCase();
      if (!q) return WEEKS;
      return WEEKS.filter((week) => [
        week.week,
        week.title,
        week.stats,
        week.ai,
        week.task,
        week.output,
        week.leetcodeTheme,
        ...week.tasks.map((task) => `${task.title} ${task.text}`),
        ...week.leetcode
      ].join(" ").toLowerCase().includes(q));
    },
    totalTasks() {
      return WEEKS.reduce((sum, week) => sum + week.tasks.length, 0);
    },
    totalProblems() {
      return WEEKS.reduce((sum, week) => sum + week.leetcode.length, 0);
    },
    completedWeeks() {
      return Object.values(this.progress.weeks).filter((item) => item.completed).length;
    },
    completedTasks() {
      return Object.values(this.progress.tasks).filter((item) => item.completed).length;
    },
    completedProblems() {
      return Object.values(this.progress.leetcode).filter((item) => item.completed).length;
    },
    taskPercent() {
      return Math.round((this.completedTasks / this.totalTasks) * 100);
    },
    leetcodePercent() {
      return Math.round((this.completedProblems / this.totalProblems) * 100);
    },
    localPercent() {
      return Math.round(((this.completedTasks + this.completedProblems) / (this.totalTasks + this.totalProblems)) * 100);
    },
    selectedQuiz() {
      return this.quizzes.find((quiz) => Number(quiz.id) === Number(this.selectedQuizId)) || null;
    },
    allQuestionsSelected() {
      return this.questions.length > 0 && this.questions.every((question) => this.selectedQuestionIds.includes(question.id));
    }
  },
  async mounted() {
    if (this.token) await this.fetchMe();
  },
  methods: {
    async api(path, options = {}) {
      const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
      if (this.token) headers.Authorization = `Bearer ${this.token}`;
      const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "请求失败");
      return data;
    },
    imageUrl(path) {
      if (!path) return "";
      return path.startsWith("http") ? path : `${API_BASE}${path}`;
    },
    notify(message) {
      this.toast = message;
      setTimeout(() => {
        if (this.toast === message) this.toast = "";
      }, 1800);
    },
    async fetchMe() {
      try {
        const data = await this.api("/api/auth/me");
        this.user = data.user;
        await this.loadAll();
      } catch {
        this.logout();
      }
    },
    async login() {
      this.loading = true;
      try {
        const data = await this.api(`/api/auth/${this.authMode}`, {
          method: "POST",
          body: JSON.stringify(this.authForm)
        });
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem(TOKEN_KEY, this.token);
        await this.loadAll();
        this.notify("登录成功");
      } catch (error) {
        this.notify(error.message);
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
    },
    async loadAll() {
      const [dashboard, progress, quizzes] = await Promise.all([
        this.api("/api/dashboard"),
        this.api("/api/progress"),
        this.api("/api/questions/quizzes")
      ]);
      this.dashboard = dashboard;
      this.quizzes = quizzes.quizzes || [];
      const selectedStillExists = this.quizzes.some((quiz) => Number(quiz.id) === Number(this.selectedQuizId));
      if (!selectedStillExists) this.selectedQuizId = this.quizzes[0]?.id || "";
      this.progress = {
        weeks: Object.fromEntries(progress.weeks.map((item) => [item.weekNumber, { completed: Boolean(item.completed), notes: item.notes || "" }])),
        tasks: Object.fromEntries((progress.tasks || []).map((item) => [`${item.weekNumber}-${item.taskKey}`, { completed: Boolean(item.completed), note: item.note || "" }])),
        leetcode: Object.fromEntries(progress.leetcode.map((item) => [`${item.weekNumber}-${item.problemIndex}`, { completed: Boolean(item.completed), note: item.note || "" }]))
      };
      const questions = this.selectedQuizId
        ? await this.api(`/api/questions?quizId=${this.selectedQuizId}`)
        : { questions: [] };
      this.questions = questions.questions.map((item) => ({ ...item, editing: false, image: null }));
      this.selectedQuestionIds = this.selectedQuestionIds.filter((id) => this.questions.some((question) => question.id === id));
      this.questions.forEach((question) => {
        if (!this.answerDrafts[question.id]) this.answerDrafts[question.id] = { answerText: "", image: null };
      });

      if (this.isAdmin) {
        const [subs, users] = await Promise.all([this.api("/api/submissions"), this.api("/api/users")]);
        this.submissions = subs.submissions.map((item) => ({ ...item, scoreDraft: item.score, feedbackDraft: item.feedback || "" }));
        this.users = users.users;
        if (this.view === "logs") await this.loadLogs();
      } else {
        const mine = await this.api("/api/submissions/my");
        this.mySubmissions = mine.submissions;
      }
    },
    weekState(weekNumber) {
      if (!this.progress.weeks[weekNumber]) this.progress.weeks[weekNumber] = { completed: false, notes: "" };
      return this.progress.weeks[weekNumber];
    },
    taskState(weekNumber, taskKey) {
      const key = `${weekNumber}-${taskKey}`;
      if (!this.progress.tasks[key]) this.progress.tasks[key] = { completed: false, note: "" };
      return this.progress.tasks[key];
    },
    problemState(weekNumber, problemIndex) {
      const key = `${weekNumber}-${problemIndex}`;
      if (!this.progress.leetcode[key]) this.progress.leetcode[key] = { completed: false, note: "" };
      return this.progress.leetcode[key];
    },
    async saveWeek(weekNumber) {
      const item = this.weekState(weekNumber);
      await this.api(`/api/progress/week/${weekNumber}`, {
        method: "PUT",
        body: JSON.stringify(item)
      });
      this.notify("周进度已保存");
      await this.loadAll();
    },
    async saveTask(weekNumber, taskKey) {
      const item = this.taskState(weekNumber, taskKey);
      await this.api(`/api/progress/task/${weekNumber}/${taskKey}`, {
        method: "PUT",
        body: JSON.stringify(item)
      });
      this.notify("任务点已打卡");
      await this.loadAll();
    },
    async saveProblem(weekNumber, problemIndex) {
      const item = this.problemState(weekNumber, problemIndex);
      await this.api(`/api/progress/leetcode/${weekNumber}/${problemIndex}`, {
        method: "PUT",
        body: JSON.stringify(item)
      });
      this.notify("刷题进度已保存");
      await this.loadAll();
    },
    weekTaskDoneCount(week) {
      return week.tasks.filter((task) => this.taskState(week.week, task.key).completed).length;
    },
    weekProblemDoneCount(week) {
      return week.leetcode.filter((problem, index) => this.problemState(week.week, index).completed).length;
    },
    weekStatusClass(week) {
      const weekDone = this.weekState(week.week).completed;
      const started = weekDone || this.weekTaskDoneCount(week) > 0 || this.weekProblemDoneCount(week) > 0 || this.weekState(week.week).notes.trim();
      return weekDone ? "done" : started ? "active" : "";
    },
    weekStatusText(week) {
      const weekDone = this.weekState(week.week).completed;
      const started = weekDone || this.weekTaskDoneCount(week) > 0 || this.weekProblemDoneCount(week) > 0 || this.weekState(week.week).notes.trim();
      return weekDone ? "已完成" : started ? "进行中" : "未开始";
    },
    toggleWeek(weekNumber) {
      this.openWeeks[weekNumber] = !this.openWeeks[weekNumber];
    },
    setFile(event, target, key = "image") {
      target[key] = event.target.files?.[0] || null;
    },
    markdown(value) {
      return markdown.render(String(value || "").trim() || "未设置");
    },
    logClass(type) {
      return `log-type ${String(type || "System").toLowerCase()}`;
    },
    async loadLogs() {
      if (!this.isAdmin) return;
      this.logFilter.busy = true;
      try {
        const params = new URLSearchParams({ limit: "300" });
        if (this.logFilter.type) params.set("type", this.logFilter.type);
        if (this.logFilter.file) params.set("file", this.logFilter.file);
        const [logs, database] = await Promise.all([
          this.api(`/api/logs?${params.toString()}`),
          this.api("/api/logs/database")
        ]);
        this.logs = logs.entries;
        this.logFiles = logs.files;
        this.databaseInfo = database;
      } catch (error) {
        this.notify(error.message);
      } finally {
        this.logFilter.busy = false;
      }
    },
    logDetails(details) {
      if (!details || typeof details !== "object") return "";
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`)
        .join(" · ");
    },
    setView(nextView) {
      this.view = nextView;
      if (nextView === "logs") this.loadLogs();
    },
    async createQuestion() {
      if (!this.selectedQuizId) {
        this.notify("请先新建或选择一个测验");
        return;
      }
      const form = new FormData();
      Object.entries(this.questionForm).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });
      form.append("quizId", this.selectedQuizId);
      await this.api("/api/questions", { method: "POST", body: form });
      this.questionForm = { title: "", content: "", answer: "", image: null };
      this.notify("题目已添加");
      await this.loadAll();
    },
    async importQuestionsJson() {
      if (!this.selectedQuizId) {
        this.notify("请先新建或选择一个测验");
        return;
      }
      if (!this.questionImport.file) {
        this.notify("请先选择 JSON、Markdown 或 TXT 文件");
        return;
      }

      this.questionImport.busy = true;
      try {
        const form = new FormData();
        form.append("file", this.questionImport.file);
        form.append("quizId", this.selectedQuizId);
        const data = await this.api("/api/questions/import-json", { method: "POST", body: form });
        this.questionImport = { file: null, busy: false };
        this.notify(`已批量导入 ${data.imported} 道题`);
        await this.loadAll();
      } catch (error) {
        this.notify(error.message);
        this.questionImport.busy = false;
      }
    },
    downloadQuestionTemplate() {
      const template = {
        questions: [
          {
            title: "描述性统计练习",
            content: "给定数据 1, 2, 3, 4, 5，请计算均值和样本方差。",
            answer: "均值为 3，样本方差为 2.5。"
          },
          {
            questionTitle: "神经网络公式练习",
            stem: "已知 Sigmoid 函数 $f(x)=\\frac{1}{1+e^{-x}}$，请写出它的导数。",
            referenceAnswer: "$f'(x)=f(x)(1-f(x))$"
          }
        ]
      };
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "question-import-template.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    async saveQuestion(question) {
      const form = new FormData();
      form.append("quizId", question.quizId || this.selectedQuizId);
      form.append("title", question.title);
      form.append("content", question.content);
      form.append("answer", question.answer || "");
      if (question.image) form.append("image", question.image);
      await this.api(`/api/questions/${question.id}`, { method: "PUT", body: form });
      question.editing = false;
      this.notify("题目已保存");
      await this.loadAll();
    },
    async deleteQuestion(id) {
      if (!confirm("确定删除这道题吗？相关提交也会删除。")) return;
      await this.api(`/api/questions/${id}`, { method: "DELETE" });
      this.selectedQuestionIds = this.selectedQuestionIds.filter((item) => item !== id);
      this.notify("题目已删除");
      await this.loadAll();
    },
    async createQuiz() {
      const title = this.quizForm.title.trim();
      if (!title) {
        this.notify("测验名称必填");
        return;
      }
      const data = await this.api("/api/questions/quizzes", {
        method: "POST",
        body: JSON.stringify(this.quizForm)
      });
      this.quizForm = { title: "", description: "" };
      this.selectedQuizId = data.id;
      this.notify("测验已创建");
      await this.loadAll();
    },
    async selectQuiz(id) {
      this.selectedQuizId = id;
      this.selectedQuestionIds = [];
      await this.loadAll();
    },
    toggleAllQuestions(event) {
      this.selectedQuestionIds = event.target.checked ? this.questions.map((question) => question.id) : [];
    },
    async bulkDeleteQuestions() {
      if (!this.selectedQuestionIds.length) {
        this.notify("请先选择题目");
        return;
      }
      if (!confirm(`确定删除选中的 ${this.selectedQuestionIds.length} 道题吗？相关提交也会删除。`)) return;
      const data = await this.api("/api/questions/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ ids: this.selectedQuestionIds })
      });
      this.selectedQuestionIds = [];
      this.notify(`已删除 ${data.deleted} 道题`);
      await this.loadAll();
    },
    async submitAnswer(questionId) {
      const draft = this.answerDrafts[questionId] || {};
      const form = new FormData();
      form.append("questionId", questionId);
      if (draft.answerText) form.append("answerText", draft.answerText);
      if (draft.image) form.append("image", draft.image);
      await this.api("/api/submissions", { method: "POST", body: form });
      this.answerDrafts[questionId] = {};
      this.notify("答案已提交，等待批改");
      await this.loadAll();
    },
    async grade(submission) {
      await this.api(`/api/submissions/${submission.id}/grade`, {
        method: "PATCH",
        body: JSON.stringify({ score: submission.scoreDraft, feedback: submission.feedbackDraft })
      });
      this.notify("评分已保存");
      await this.loadAll();
    },
    async saveUser(item) {
      await this.api(`/api/users/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: item.role, isActive: item.isActive, displayName: item.displayName })
      });
      this.notify("用户已更新");
      await this.loadAll();
    }
  },
  template: `
    <div>
      <div v-if="!user" class="auth-page">
        <section class="auth-card">
          <div class="brand-line"><span class="brand-mark"></span><strong>Stat AI Bootcamp</strong></div>
          <h1>Statistics × Artificial Intelligence</h1>
          <p>统计学专业大一学生 2 个月通用人工智能学习平台。</p>
          <form @submit.prevent="login" class="auth-form">
            <input v-model="authForm.username" required placeholder="用户名" autocomplete="username">
            <input v-model="authForm.password" required type="password" placeholder="密码" autocomplete="current-password">
            <input v-if="authMode === 'register'" v-model="authForm.displayName" placeholder="姓名 / 昵称">
            <button class="btn primary" :disabled="loading">{{ authMode === 'login' ? '登录' : '注册' }}</button>
          </form>
          <button class="link-btn" @click="authMode = authMode === 'login' ? 'register' : 'login'">
            {{ authMode === 'login' ? '没有账号？注册学生账号' : '已有账号？返回登录' }}
          </button>
        </section>
      </div>

      <template v-else>
        <header class="topbar">
          <div class="brand-line"><span class="brand-mark"></span><strong>Stat AI Bootcamp</strong></div>
          <nav>
            <button @click="setView('dashboard')" :class="{active:view==='dashboard'}">看板</button>
            <button v-if="!isAdmin" @click="setView('plan')" :class="{active:view==='plan'}">学习计划</button>
            <button @click="setView('questions')" :class="{active:view==='questions'}">{{ isAdmin ? '题目管理' : '题目提交' }}</button>
            <button v-if="isAdmin" @click="setView('grading')" :class="{active:view==='grading'}">批改审查</button>
            <button v-if="isAdmin" @click="setView('users')" :class="{active:view==='users'}">用户管理</button>
            <button v-if="isAdmin" @click="setView('logs')" :class="{active:view==='logs'}">日志文档</button>
          </nav>
          <div class="user-box"><span>{{ user.displayName }} · {{ isAdmin ? '管理员' : '学生' }}</span><button @click="logout">退出</button></div>
        </header>

        <main class="shell">
          <section class="hero">
            <div>
              <h1>Statistics × Artificial Intelligence</h1>
              <p>从 Python 编程、数据分析、统计建模出发，进入机器学习、深度学习、大模型应用与 AI 项目实践。</p>
            </div>
            <div class="ring" :style="{'--value': localPercent + '%'}"><span>{{ localPercent }}%</span></div>
          </section>

          <section v-if="view==='dashboard' && isAdmin" class="panel">
            <div class="section-head"><h2>学习进度看板</h2><p>数据来自 MySQL，按当前登录账号统计。</p></div>
            <div class="stat-grid" v-if="dashboard">
              <article><strong>{{ dashboard.cards.students }}</strong><span>学生数</span></article>
              <article><strong>{{ dashboard.cards.quizzes }}</strong><span>测验数</span></article>
              <article><strong>{{ dashboard.cards.questions }}</strong><span>题目数</span></article>
              <article><strong>{{ dashboard.cards.pending }}</strong><span>待批改</span></article>
              <article><strong>{{ dashboard.cards.graded }}</strong><span>已批改</span></article>
            </div>
            <div v-if="dashboard?.recent?.length" class="table-wrap">
              <table><thead><tr><th>学生</th><th>题目</th><th>状态</th><th>分数</th><th>更新时间</th></tr></thead>
              <tbody><tr v-for="item in dashboard.recent" :key="item.id"><td>{{ item.displayName }}</td><td>{{ item.title }}</td><td>{{ item.status }}</td><td>{{ item.score ?? '-' }}</td><td>{{ item.updatedAt }}</td></tr></tbody></table>
            </div>
          </section>

          <template v-if="view==='dashboard' && !isAdmin">
            <section class="progress-overview">
              <div class="section-title">
                <h2>学习进度总览</h2>
                <p>勾选每个任务点和 LeetCode 题目后，进度会保存到服务器，换设备登录也能继续。</p>
              </div>
              <div class="dashboard-layout">
                <div class="progress-panel">
                  <div class="progress-row"><span>总进度</span><strong>{{ localPercent }}%</strong></div>
                  <div class="bar"><span :style="{width: localPercent + '%'}"></span></div>
                  <div class="progress-row"><span>任务点完成数</span><strong>{{ completedTasks }} / {{ totalTasks }}</strong></div>
                  <div class="bar"><span :style="{width: taskPercent + '%'}"></span></div>
                  <div class="progress-row"><span>LeetCode 完成数</span><strong>{{ completedProblems }} / {{ totalProblems }}</strong></div>
                  <div class="bar"><span :style="{width: leetcodePercent + '%'}"></span></div>
                </div>
                <div class="progress-panel">
                  <div class="progress-row"><span>服务器记录</span><strong>MySQL</strong></div>
                  <p>本平台按账号保存学习计划、任务点打卡、刷题状态和学习记录。你可以从“学习计划”进入每周卡片逐项打卡。</p>
                  <div class="controls">
                    <button class="btn primary" @click="setView('plan')">进入 8 周计划</button>
                    <button class="btn" @click="setView('questions')">查看题目</button>
                  </div>
                </div>
              </div>
            </section>

            <section class="progress-overview">
              <div class="section-title">
                <h2>培养目标</h2>
                <p>围绕统计学专业优势，强调数据、模型、评价和解释，而不是单纯追逐模型调用。</p>
              </div>
              <div class="goal-grid">
                <article v-for="goal in GOALS" :key="goal[0]" class="goal-card">
                  <h3>{{ goal[0] }}</h3>
                  <p>{{ goal[1] }}</p>
                </article>
              </div>
            </section>
          </template>

          <section v-if="view==='plan'" class="panel">
            <div class="section-title compact"><div><h2>8 周学习计划</h2><p>每周包含统计学重点、AI 重点、实验任务、周产出和 LeetCode。任务点与题目都可单独打卡。</p></div></div>
            <input v-model="search" class="search" placeholder="搜索周次、主题、统计重点、AI重点或 LeetCode 题目...">
            <div v-if="!filteredWeeks.length" class="empty">没有匹配的学习任务</div>
            <article v-for="week in filteredWeeks" :key="week.week" class="week-card" :class="{open: openWeeks[week.week]}">
              <div class="week-head" @click="toggleWeek(week.week)">
                <div class="week-index">W{{ week.week }}</div>
                <div class="week-title">
                  <h3>{{ week.title }}</h3>
                  <p>{{ week.stats }}</p>
                </div>
                <div class="status" :class="weekStatusClass(week)">{{ weekStatusText(week) }}</div>
              </div>
              <div class="week-body">
                <div class="week-tools">
                  <label class="checkline" @click.stop><input type="checkbox" v-model="weekState(week.week).completed" @change="saveWeek(week.week)"> 完成本周计划</label>
                  <span class="tag">任务点 {{ weekTaskDoneCount(week) }} / {{ week.tasks.length }}</span>
                  <span class="tag">LeetCode {{ weekProblemDoneCount(week) }} / {{ week.leetcode.length }}</span>
                  <span class="tag">{{ week.leetcodeTheme }}</span>
                </div>

                <div class="detail-grid">
                  <div v-for="task in week.tasks" :key="task.key" class="detail">
                    <label class="task-check">
                      <input type="checkbox" v-model="taskState(week.week, task.key).completed" @change="saveTask(week.week, task.key)">
                      <b>{{ task.title }}</b>
                    </label>
                    <span>{{ task.text }}</span>
                    <input v-model="taskState(week.week, task.key).note" @blur="saveTask(week.week, task.key)" placeholder="任务备注 / 证据链接">
                  </div>
                </div>

                <div class="detail leetcode-block">
                  <b>LeetCode：{{ week.leetcodeTheme }}</b>
                  <div class="leetcode-list">
                    <div v-for="(problem, index) in week.leetcode" :key="problem" class="problem-row">
                      <label><input type="checkbox" v-model="problemState(week.week,index).completed" @change="saveProblem(week.week,index)"> {{ problem }}</label>
                      <input v-model="problemState(week.week,index).note" @blur="saveProblem(week.week,index)" placeholder="错题原因 / 复盘记录">
                    </div>
                  </div>
                </div>

                <textarea v-model="weekState(week.week).notes" @blur="saveWeek(week.week)" placeholder="本周完成内容 / 遇到的问题 / 下周计划 / 错题原因..."></textarea>
              </div>
            </article>
          </section>

          <section v-if="view==='questions'" class="panel">
            <div class="section-head"><h2>{{ isAdmin ? '测验与题目管理' : '测验题目提交' }}</h2><p>先选择测验，再查看或维护该测验下的题目。支持 Markdown 公式、参考答案和图片。</p></div>
            <form v-if="isAdmin" @submit.prevent="createQuiz" class="quiz-create">
              <input v-model="quizForm.title" required placeholder="新建测验名称，例如：五月考试">
              <input v-model="quizForm.description" placeholder="测验说明，可选">
              <button class="btn primary">新建测验</button>
            </form>
            <div class="quiz-tabs" v-if="quizzes.length">
              <button v-for="quiz in quizzes" :key="quiz.id" class="quiz-tab" :class="{active:Number(selectedQuizId)===Number(quiz.id)}" @click="selectQuiz(quiz.id)">
                <strong>{{ quiz.title }}</strong>
                <span>{{ quiz.questionCount }} 题</span>
              </button>
            </div>
            <div v-else class="empty">{{ isAdmin ? '请先新建一个测验' : '暂无可提交的测验' }}</div>
            <div v-if="selectedQuiz" class="quiz-current">
              <div>
                <h3>{{ selectedQuiz.title }}</h3>
                <p>{{ selectedQuiz.description || '暂无测验说明' }}</p>
              </div>
              <span class="tag">{{ questions.length }} 道题</span>
            </div>
            <form v-if="isAdmin" @submit.prevent="createQuestion" class="editor">
              <input v-model="questionForm.title" required placeholder="题目标题">
              <textarea v-model="questionForm.content" required placeholder="题目内容"></textarea>
              <textarea v-model="questionForm.answer" placeholder="参考答案，仅管理员可见"></textarea>
              <input type="file" accept="image/*" @change="setFile($event, questionForm)">
              <button class="btn primary" :disabled="!selectedQuizId">添加到当前测验</button>
            </form>
            <form v-if="isAdmin" @submit.prevent="importQuestionsJson" class="import-box">
              <div>
                <div class="import-title">
                  <h3>批量导入题目</h3>
                  <button type="button" class="help-icon" @click="showImportHelp = !showImportHelp" :aria-expanded="showImportHelp" aria-label="查看导入格式说明">?</button>
                </div>
                <p>上传 JSON、Markdown 或 TXT 文件，导入到当前测验。Markdown 支持表格、列表和 $...$ / $$...$$ 公式。</p>
              </div>
              <input type="file" accept="application/json,text/markdown,text/plain,.json,.md,.markdown,.txt" @change="setFile($event, questionImport, 'file')">
              <button type="button" class="btn" @click="downloadQuestionTemplate">下载模板</button>
              <button class="btn" :disabled="questionImport.busy || !selectedQuizId">{{ questionImport.busy ? '导入中...' : '批量导入到当前测验' }}</button>
              <div v-if="showImportHelp" class="import-help">
                <p><strong>JSON：</strong>直接使用题目数组，或使用 { questions: [...] }。</p>
                <pre>[
  {
    "title": "描述性统计练习",
    "content": "给定数据 1, 2, 3, 4, 5，请计算均值和样本方差。",
    "answer": "均值为 3，样本方差为 2.5。"
  }
]</pre>
                <p><strong>支持格式 2：</strong>使用 questions 字段。</p>
                <pre>{
  "questions": [
    {
      "title": "线性回归概念",
      "content": "请解释最小二乘法的目标函数。",
      "answer": "最小化预测值与真实值残差平方和。"
    }
  ]
}</pre>
                <p><strong>Markdown/TXT：</strong>用一级标题或“第 n 题：...”分隔题目，用“## 参考答案”分隔答案。</p>
                <pre># 第 1 题：Sigmoid 公式
已知 $f(x)=\frac{1}{1+e^{-x}}$，请写出导数。

## 参考答案
$f'(x)=f(x)(1-f(x))$</pre>
                <p>必填：title、content。选填：answer、imagePath。JSON 也兼容 questionTitle、stem、referenceAnswer 等字段名。</p>
              </div>
            </form>
            <div v-if="isAdmin && selectedQuiz" class="bulk-toolbar">
              <label><input type="checkbox" :checked="allQuestionsSelected" @change="toggleAllQuestions"> 全选当前测验题目</label>
              <span>{{ selectedQuestionIds.length }} / {{ questions.length }} 已选择</span>
              <button class="btn danger" :disabled="!selectedQuestionIds.length" @click="bulkDeleteQuestions">批量删除</button>
            </div>
            <article v-for="question in questions" :key="question.id" class="question-card">
              <template v-if="isAdmin && question.editing">
                <select v-model="question.quizId">
                  <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">{{ quiz.title }}</option>
                </select>
                <input v-model="question.title">
                <textarea v-model="question.content"></textarea>
                <textarea v-model="question.answer"></textarea>
                <input type="file" accept="image/*" @change="setFile($event, question)">
                <div class="actions"><button class="btn primary" @click="saveQuestion(question)">保存</button><button class="btn" @click="question.editing=false">取消</button></div>
              </template>
              <template v-else>
                <div class="question-title-row">
                  <label v-if="isAdmin" class="row-check"><input type="checkbox" :value="question.id" v-model="selectedQuestionIds"></label>
                  <h3>{{ question.title }}</h3>
                </div>
                <div class="markdown-body" v-html="markdown(question.content)"></div>
                <img v-if="question.imagePath" :src="imageUrl(question.imagePath)" alt="题目图片">
                <div v-if="isAdmin" class="answer"><strong>参考答案</strong><div class="markdown-body" v-html="markdown(question.answer)"></div></div>
                <div v-if="isAdmin" class="actions"><button class="btn" @click="question.editing=true">编辑</button><button class="btn danger" @click="deleteQuestion(question.id)">删除</button></div>
                <form v-else @submit.prevent="submitAnswer(question.id)" class="submit-box">
                  <textarea v-model="answerDrafts[question.id].answerText" placeholder="输入你的答案"></textarea>
                  <input type="file" accept="image/*" @change="setFile($event, answerDrafts[question.id])">
                  <button class="btn primary">提交答案</button>
                </form>
              </template>
            </article>
            <div v-if="selectedQuiz && !questions.length" class="empty">当前测验暂无题目</div>
            <div v-if="!isAdmin && mySubmissions.length" class="table-wrap">
              <table><thead><tr><th>测验</th><th>题目</th><th>状态</th><th>分数</th><th>反馈</th></tr></thead>
              <tbody><tr v-for="item in mySubmissions" :key="item.id"><td>{{ item.quizTitle || '-' }}</td><td>{{ item.title }}</td><td>{{ item.status }}</td><td>{{ item.score ?? '-' }}</td><td>{{ item.feedback || '-' }}</td></tr></tbody></table>
            </div>
          </section>

          <section v-if="view==='grading' && isAdmin" class="panel">
            <div class="section-head"><h2>批改审查</h2><p>查看学生文本与图片答案，手动给分并写反馈。</p></div>
            <article v-for="item in submissions" :key="item.id" class="question-card">
              <h3>{{ item.title }}</h3>
              <p class="muted">{{ item.quizTitle || '未分组测验' }} · {{ item.displayName }}（{{ item.username }}） · {{ item.status }}</p>
              <div class="markdown-body" v-html="markdown(item.answerText)"></div>
              <img v-if="item.imagePath" :src="imageUrl(item.imagePath)" alt="学生提交图片">
              <div class="grade-grid"><input v-model="item.scoreDraft" type="number" min="0" max="100" placeholder="分数 0-100"><textarea v-model="item.feedbackDraft" placeholder="批改反馈"></textarea><button class="btn primary" @click="grade(item)">保存评分</button></div>
            </article>
            <div v-if="!submissions.length" class="empty">暂无学生提交</div>
          </section>

          <section v-if="view==='users' && isAdmin" class="panel">
            <div class="section-head"><h2>用户管理</h2><p>管理学生和管理员账户状态。</p></div>
            <div class="table-wrap">
              <table><thead><tr><th>用户名</th><th>显示名</th><th>角色</th><th>启用</th><th>操作</th></tr></thead>
              <tbody><tr v-for="item in users" :key="item.id"><td>{{ item.username }}</td><td><input v-model="item.displayName"></td><td><select v-model="item.role"><option value="student">student</option><option value="admin">admin</option></select></td><td><input type="checkbox" v-model="item.isActive"></td><td><button class="btn" @click="saveUser(item)">保存</button></td></tr></tbody></table>
            </div>
          </section>

          <section v-if="view==='logs' && isAdmin" class="panel">
            <div class="section-head split">
              <div>
                <h2>日志文档</h2>
                <p>按 5 天保存一个日志文件，记录访问 IP、用户操作、管理员操作和数据库写入事件。</p>
              </div>
              <button class="btn primary" @click="loadLogs" :disabled="logFilter.busy">{{ logFilter.busy ? '刷新中...' : '刷新' }}</button>
            </div>
            <div class="log-controls">
              <select v-model="logFilter.type" @change="loadLogs">
                <option value="">全部类型</option>
                <option value="Access">Access</option>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Database">Database</option>
                <option value="System">System</option>
              </select>
              <select v-model="logFilter.file" @change="loadLogs">
                <option value="">最近日志文件</option>
                <option v-for="file in logFiles" :key="file" :value="file">{{ file }}</option>
              </select>
            </div>
            <div v-if="databaseInfo" class="db-summary">
              <article><strong>{{ databaseInfo.database }}</strong><span>数据库</span></article>
              <article><strong>{{ databaseInfo.counts.quizzes }}</strong><span>测验</span></article>
              <article><strong>{{ databaseInfo.counts.users }}</strong><span>用户</span></article>
              <article><strong>{{ databaseInfo.counts.questions }}</strong><span>题目</span></article>
              <article><strong>{{ databaseInfo.counts.submissions }}</strong><span>提交</span></article>
            </div>
            <div v-if="databaseInfo?.tables?.length" class="table-wrap compact-table">
              <table><thead><tr><th>表</th><th>估算行数</th><th>数据大小</th><th>索引大小</th></tr></thead>
              <tbody><tr v-for="table in databaseInfo.tables" :key="table.tableName"><td>{{ table.tableName }}</td><td>{{ table.tableRows ?? '-' }}</td><td>{{ table.dataLength }}</td><td>{{ table.indexLength }}</td></tr></tbody></table>
            </div>
            <div class="log-list">
              <article v-for="entry in logs" :key="entry.file + entry.time + entry.action + JSON.stringify(entry.details)" class="log-entry">
                <div class="log-head">
                  <span :class="logClass(entry.type)">[{{ entry.type || 'System' }}]</span>
                  <strong>{{ entry.action }}</strong>
                  <time>{{ entry.time }}</time>
                </div>
                <div class="log-meta">
                  <span>{{ entry.file }}</span>
                  <span v-if="entry.ip">IP {{ entry.ip }}</span>
                  <span v-if="entry.method">{{ entry.method }} {{ entry.path }}</span>
                  <span v-if="entry.actor">账号 {{ entry.actor.username }} · {{ entry.actor.role }}</span>
                </div>
                <p v-if="logDetails(entry.details)">{{ logDetails(entry.details) }}</p>
              </article>
              <div v-if="!logs.length" class="empty">暂无日志记录</div>
            </div>
          </section>

          <section v-if="!isAdmin" class="panel">
            <div class="section-title compact"><div><h2>LeetCode 刷题安排</h2><p>以 Easy 为主，目标是建立 Python 代码基本功、复杂度意识和错题复盘习惯。</p></div></div>
            <div class="table-wrap">
              <table><thead><tr><th>周次</th><th>算法主题</th><th>题目</th><th>完成</th></tr></thead>
              <tbody><tr v-for="week in WEEKS" :key="week.week"><td>第 {{ week.week }} 周</td><td>{{ week.leetcodeTheme }}</td><td>{{ week.leetcode.join('；') }}</td><td>{{ weekProblemDoneCount(week) }} / {{ week.leetcode.length }}</td></tr></tbody></table>
            </div>
          </section>

          <section class="panel">
            <div class="section-title compact"><div><h2>结课项目选题</h2><p>项目建议优先选择“统计分析 + AI 建模”的可复现小项目。</p></div></div>
            <div class="project-grid">
              <article v-for="project in PROJECTS" :key="project[0]">
                <h3>{{ project[0] }}</h3>
                <p><b>路线：</b>{{ project[1] }}</p>
                <p><b>交付：</b>{{ project[2] }}</p>
                <div class="tag-row"><span v-for="tag in project[3]" :key="tag" class="tag">{{ tag }}</span></div>
              </article>
            </div>
          </section>

          <section v-if="!isAdmin" class="panel">
            <div class="section-title compact"><div><h2>考核标准</h2><p>过程性评价优先：代码、实验、解释、复盘和项目可复现性都纳入考核。</p></div></div>
            <div class="table-wrap">
              <table><thead><tr><th>考核模块</th><th>权重</th><th>合格标准</th><th>优秀标准</th></tr></thead>
              <tbody><tr v-for="row in ASSESSMENT" :key="row[0]"><td v-for="cell in row" :key="cell">{{ cell }}</td></tr></tbody></table>
            </div>
          </section>
        </main>
      </template>
      <div class="toast" v-if="toast">{{ toast }}</div>
    </div>
  `,
  setup() {
    return { WEEKS, GOALS, PROJECTS, ASSESSMENT };
  }
}).mount("#app");
