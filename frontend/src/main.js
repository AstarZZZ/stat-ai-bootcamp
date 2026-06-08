import { createApp } from "vue/dist/vue.esm-bundler.js";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const TOKEN_KEY = "stat_ai_bootcamp_token";

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

const PROJECTS = [
  ["表格数据预测建模", "数据清洗 → EDA → 线性/Logistic 回归 → 随机森林/XGBoost 可选 → 指标评估"],
  ["时间序列预测", "时间序列可视化 → 移动平均 → ARIMA/Prophet 可选 → 机器学习预测"],
  ["文本分类与统计分析", "文本清洗 → 词频统计 → TF-IDF → Logistic 回归/朴素贝叶斯 → LLM 对比"],
  ["A/B 测试与因果推断模拟", "随机实验模拟 → 假设检验 → 置信区间 → uplift 分析 → 可视化"],
  ["LLM 数据分析助手", "上传表格数据 → 设计 prompt → 让 LLM 生成分析思路 → Python 验证结果"],
  ["降维与聚类分析", "标准化 → PCA/t-SNE 可选 → K-means/层次聚类 → 聚类解释"],
  ["推荐系统小实验", "用户-物品矩阵 → 相似度计算 → 协同过滤 → 推荐结果评估"]
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
      progress: { weeks: {}, leetcode: {} },
      questions: [],
      submissions: [],
      mySubmissions: [],
      users: [],
      questionForm: { title: "", content: "", answer: "", image: null },
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
        ...week.leetcode
      ].join(" ").toLowerCase().includes(q));
    },
    totalProblems() {
      return WEEKS.reduce((sum, week) => sum + week.leetcode.length, 0);
    },
    completedWeeks() {
      return Object.values(this.progress.weeks).filter((item) => item.completed).length;
    },
    completedProblems() {
      return Object.values(this.progress.leetcode).filter((item) => item.completed).length;
    },
    localPercent() {
      return Math.round(((this.completedWeeks + this.completedProblems) / (8 + this.totalProblems)) * 100);
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
      const [dashboard, progress, questions] = await Promise.all([
        this.api("/api/dashboard"),
        this.api("/api/progress"),
        this.api("/api/questions")
      ]);
      this.dashboard = dashboard;
      this.progress = {
        weeks: Object.fromEntries(progress.weeks.map((item) => [item.weekNumber, { completed: Boolean(item.completed), notes: item.notes || "" }])),
        leetcode: Object.fromEntries(progress.leetcode.map((item) => [`${item.weekNumber}-${item.problemIndex}`, { completed: Boolean(item.completed), note: item.note || "" }]))
      };
      this.questions = questions.questions.map((item) => ({ ...item, editing: false, image: null }));
      this.questions.forEach((question) => {
        if (!this.answerDrafts[question.id]) this.answerDrafts[question.id] = { answerText: "", image: null };
      });

      if (this.isAdmin) {
        const [subs, users] = await Promise.all([this.api("/api/submissions"), this.api("/api/users")]);
        this.submissions = subs.submissions.map((item) => ({ ...item, scoreDraft: item.score, feedbackDraft: item.feedback || "" }));
        this.users = users.users;
      } else {
        const mine = await this.api("/api/submissions/my");
        this.mySubmissions = mine.submissions;
      }
    },
    weekState(weekNumber) {
      if (!this.progress.weeks[weekNumber]) this.progress.weeks[weekNumber] = { completed: false, notes: "" };
      return this.progress.weeks[weekNumber];
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
    async saveProblem(weekNumber, problemIndex) {
      const item = this.problemState(weekNumber, problemIndex);
      await this.api(`/api/progress/leetcode/${weekNumber}/${problemIndex}`, {
        method: "PUT",
        body: JSON.stringify(item)
      });
      this.notify("刷题进度已保存");
      await this.loadAll();
    },
    setFile(event, target, key = "image") {
      target[key] = event.target.files?.[0] || null;
    },
    async createQuestion() {
      const form = new FormData();
      Object.entries(this.questionForm).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });
      await this.api("/api/questions", { method: "POST", body: form });
      this.questionForm = { title: "", content: "", answer: "", image: null };
      this.notify("题目已添加");
      await this.loadAll();
    },
    async saveQuestion(question) {
      const form = new FormData();
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
      this.notify("题目已删除");
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
            <button @click="view='dashboard'" :class="{active:view==='dashboard'}">看板</button>
            <button v-if="!isAdmin" @click="view='plan'" :class="{active:view==='plan'}">学习计划</button>
            <button @click="view='questions'" :class="{active:view==='questions'}">{{ isAdmin ? '题目管理' : '题目提交' }}</button>
            <button v-if="isAdmin" @click="view='grading'" :class="{active:view==='grading'}">批改审查</button>
            <button v-if="isAdmin" @click="view='users'" :class="{active:view==='users'}">用户管理</button>
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

          <section v-if="view==='dashboard'" class="panel">
            <div class="section-head"><h2>学习进度看板</h2><p>数据来自 MySQL，按当前登录账号统计。</p></div>
            <div class="stat-grid" v-if="dashboard">
              <article v-if="isAdmin"><strong>{{ dashboard.cards.students }}</strong><span>学生数</span></article>
              <article v-if="isAdmin"><strong>{{ dashboard.cards.questions }}</strong><span>题目数</span></article>
              <article v-if="isAdmin"><strong>{{ dashboard.cards.pending }}</strong><span>待批改</span></article>
              <article v-if="isAdmin"><strong>{{ dashboard.cards.graded }}</strong><span>已批改</span></article>
              <article v-if="!isAdmin"><strong>{{ dashboard.cards.weekDone }} / 8</strong><span>完成周数</span></article>
              <article v-if="!isAdmin"><strong>{{ dashboard.cards.leetcodeDone }} / {{ totalProblems }}</strong><span>刷题完成</span></article>
              <article v-if="!isAdmin"><strong>{{ dashboard.cards.graded }}</strong><span>已评分提交</span></article>
              <article v-if="!isAdmin"><strong>{{ dashboard.cards.averageScore }}</strong><span>平均分</span></article>
            </div>
            <div class="bar"><span :style="{width: localPercent + '%'}"></span></div>
            <div v-if="isAdmin && dashboard?.recent?.length" class="table-wrap">
              <table><thead><tr><th>学生</th><th>题目</th><th>状态</th><th>分数</th><th>更新时间</th></tr></thead>
              <tbody><tr v-for="item in dashboard.recent" :key="item.id"><td>{{ item.displayName }}</td><td>{{ item.title }}</td><td>{{ item.status }}</td><td>{{ item.score ?? '-' }}</td><td>{{ item.updatedAt }}</td></tr></tbody></table>
            </div>
          </section>

          <section v-if="view==='plan'" class="panel">
            <div class="section-head split"><div><h2>8 周学习计划</h2><p>完成状态和学习记录保存到服务器。</p></div><input v-model="search" class="search" placeholder="搜索周次、主题、重点或题目"></div>
            <div v-if="!filteredWeeks.length" class="empty">没有匹配的学习任务</div>
            <article v-for="week in filteredWeeks" :key="week.week" class="week-card">
              <div class="week-top">
                <div><h3>第 {{ week.week }} 周 · {{ week.title }}</h3><p>{{ week.output }}</p></div>
                <label><input type="checkbox" v-model="weekState(week.week).completed" @change="saveWeek(week.week)"> 完成本周计划</label>
              </div>
              <details open>
                <summary>学习重点</summary>
                <div class="detail-grid">
                  <p><strong>统计学重点</strong>{{ week.stats }}</p>
                  <p><strong>AI / 机器学习重点</strong>{{ week.ai }}</p>
                  <p><strong>Python / 实验任务</strong>{{ week.task }}</p>
                </div>
              </details>
              <div class="leetcode-list">
                <div v-for="(problem, index) in week.leetcode" :key="problem" class="problem-row">
                  <label><input type="checkbox" v-model="problemState(week.week,index).completed" @change="saveProblem(week.week,index)"> {{ problem }}</label>
                  <input v-model="problemState(week.week,index).note" @blur="saveProblem(week.week,index)" placeholder="错题原因 / 复盘记录">
                </div>
              </div>
              <textarea v-model="weekState(week.week).notes" @blur="saveWeek(week.week)" placeholder="本周完成内容、遇到的问题、下周计划、LeetCode 错题原因"></textarea>
            </article>
          </section>

          <section v-if="view==='questions'" class="panel">
            <div class="section-head"><h2>{{ isAdmin ? '题目管理' : '题目提交' }}</h2><p>支持文本题干、答案和图片上传。学生提交后由管理员手动批改。</p></div>
            <form v-if="isAdmin" @submit.prevent="createQuestion" class="editor">
              <input v-model="questionForm.title" required placeholder="题目标题">
              <textarea v-model="questionForm.content" required placeholder="题目内容"></textarea>
              <textarea v-model="questionForm.answer" placeholder="参考答案，仅管理员可见"></textarea>
              <input type="file" accept="image/*" @change="setFile($event, questionForm)">
              <button class="btn primary">添加题目</button>
            </form>
            <article v-for="question in questions" :key="question.id" class="question-card">
              <template v-if="isAdmin && question.editing">
                <input v-model="question.title">
                <textarea v-model="question.content"></textarea>
                <textarea v-model="question.answer"></textarea>
                <input type="file" accept="image/*" @change="setFile($event, question)">
                <div class="actions"><button class="btn primary" @click="saveQuestion(question)">保存</button><button class="btn" @click="question.editing=false">取消</button></div>
              </template>
              <template v-else>
                <h3>{{ question.title }}</h3>
                <p>{{ question.content }}</p>
                <img v-if="question.imagePath" :src="imageUrl(question.imagePath)" alt="题目图片">
                <p v-if="isAdmin" class="answer">参考答案：{{ question.answer || '未设置' }}</p>
                <div v-if="isAdmin" class="actions"><button class="btn" @click="question.editing=true">编辑</button><button class="btn danger" @click="deleteQuestion(question.id)">删除</button></div>
                <form v-else @submit.prevent="submitAnswer(question.id)" class="submit-box">
                  <textarea v-model="answerDrafts[question.id].answerText" placeholder="输入你的答案"></textarea>
                  <input type="file" accept="image/*" @change="setFile($event, answerDrafts[question.id])">
                  <button class="btn primary">提交答案</button>
                </form>
              </template>
            </article>
            <div v-if="!isAdmin && mySubmissions.length" class="table-wrap">
              <table><thead><tr><th>题目</th><th>状态</th><th>分数</th><th>反馈</th></tr></thead>
              <tbody><tr v-for="item in mySubmissions" :key="item.id"><td>{{ item.title }}</td><td>{{ item.status }}</td><td>{{ item.score ?? '-' }}</td><td>{{ item.feedback || '-' }}</td></tr></tbody></table>
            </div>
          </section>

          <section v-if="view==='grading' && isAdmin" class="panel">
            <div class="section-head"><h2>批改审查</h2><p>查看学生文本与图片答案，手动给分并写反馈。</p></div>
            <article v-for="item in submissions" :key="item.id" class="question-card">
              <h3>{{ item.title }}</h3>
              <p class="muted">{{ item.displayName }}（{{ item.username }}） · {{ item.status }}</p>
              <p>{{ item.answerText }}</p>
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

          <section class="panel">
            <div class="section-head"><h2>结课项目方向</h2><p>建议 2-3 人一组完成可复现项目。</p></div>
            <div class="project-grid"><article v-for="project in PROJECTS" :key="project[0]"><h3>{{ project[0] }}</h3><p>{{ project[1] }}</p></article></div>
          </section>
        </main>
      </template>
      <div class="toast" v-if="toast">{{ toast }}</div>
    </div>
  `,
  setup() {
    return { PROJECTS };
  }
}).mount("#app");
