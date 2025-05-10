---
title: "简单了解下pandas/numpy/matplotlib  "
excerpt: "python里面比较常用的一些工具."
coverImage: "/assets/blog/preview/cover.jpg"
date: "2020-03-16T05:35:07.322Z"
author:
  name: 张明
  picture: "/assets/blog/authors/joe.jpeg"
ogImage:
  url: "/assets/blog/preview/cover.jpg"
---

# 下面是对 pandas 的深入介绍：

## 1. pandas 是什么？

pandas 是 Python 最常用的数据分析库之一，专门用于处理和分析结构化数据（如表格、时间序列等）。它的核心数据结构是 DataFrame（类似于 Excel 表格）和 Series（一维数据）。

---

## 2. 核心数据结构

### （1）Series
- 一维数据结构，带有索引。
- 类似于一列数据。
- 示例：
  ```python
  import pandas as pd
  s = pd.Series([10, 20, 30], index=['a', 'b', 'c'])
  print(s)
  ```

### （2）DataFrame
- 二维表格型数据结构，带有行索引和列名。
- 类似于 Excel 表格或数据库中的表。
- 示例：
  ```python
  data = {'name': ['Tom', 'Jerry'], 'age': [20, 21]}
  df = pd.DataFrame(data)
  print(df)
  ```

---

## 3. 常用功能

### （1）数据读取与保存
- 读取 CSV 文件：
  ```python
  df = pd.read_csv('data.csv')
  ```
- 保存为 CSV 文件：
  ```python
  df.to_csv('output.csv', index=False)
  ```

### （2）数据查看与基本操作
- 查看前几行/后几行：
  ```python
  df.head()    # 前5行
  df.tail(3)   # 后3行
  ```
- 查看数据基本信息：
  ```python
  df.info()
  df.describe()
  ```

### （3）数据选择与筛选
- 选择某一列：
  ```python
  df['name']
  ```
- 条件筛选：
  ```python
  df[df['age'] > 20]
  ```
- 选择多列：
  ```python
  df[['name', 'age']]
  ```

### （4）数据清洗
- 缺失值处理：
  ```python
  df.dropna()         # 删除有缺失值的行
  df.fillna(0)        # 用0填充缺失值
  ```
- 重命名列名：
  ```python
  df.rename(columns={'name': 'Name'})
  ```

### （5）数据统计与分组
- 统计某列均值：
  ```python
  df['age'].mean()
  ```
- 分组统计：
  ```python
  df.groupby('name').mean()
  ```

### （6）数据合并与拼接
- 合并两个 DataFrame（类似 SQL 的 join）：
  ```python
  pd.merge(df1, df2, on='key')
  ```
- 拼接 DataFrame（上下/左右）：
  ```python
  pd.concat([df1, df2], axis=0)  # 纵向拼接
  pd.concat([df1, df2], axis=1)  # 横向拼接
  ```

---

## 4. pandas 的优势

- 语法简洁，功能强大，适合数据清洗、分析、可视化前的数据准备。
- 与 numpy、matplotlib、scikit-learn 等库无缝集成。
- 支持多种数据格式（CSV、Excel、SQL、JSON等）。

---

## 5. 典型应用场景

- 数据预处理与清洗
- 数据探索性分析（EDA）
- 数据统计与可视化
- 时间序列分析
- 数据导入导出


# 下面是对 numpy 的深入介绍：

## 1. numpy 是什么？

**numpy**（Numerical Python）是 Python 科学计算的基础库，主要用于高效的数值计算和多维数组操作。它为 Python 提供了类似于 MATLAB 的强大数组对象和丰富的数学函数库。

---

## 2. 核心数据结构

### ndarray（N维数组对象）
- numpy 的核心是 `ndarray`，可以是1维、2维、甚至更高维的数组。
- 比 Python 原生的 list 更高效，支持批量运算（向量化）。

**示例：**
```python
import numpy as np
a = np.array([1, 2, 3])         # 一维数组
b = np.array([[1, 2], [3, 4]])  # 二维数组
print(a)
print(b)
```

---

## 3. 常用功能

### （1）数组创建
```python
np.zeros((2, 3))      # 创建2行3列的全零数组
np.ones((3, 3))       # 创建3x3的全1数组
np.arange(0, 10, 2)   # 创建0到10，步长为2的数组
np.linspace(0, 1, 5)  # 创建0到1之间均匀分布的5个数
```

### （2）数组属性
```python
a.shape      # 数组的形状
a.dtype      # 数据类型
a.size       # 元素总数
a.ndim       # 维度数
```

### （3）数组运算（向量化）
- 支持加减乘除等运算，直接作用于整个数组，效率高。
```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
print(a + b)      # [5 7 9]
print(a * 2)      # [2 4 6]
print(a > 1)      # [False  True  True]
```

### （4）常用数学函数
```python
np.mean(a)        # 平均值
np.sum(a)         # 求和
np.max(a)         # 最大值
np.min(a)         # 最小值
np.std(a)         # 标准差
np.dot(a, b)      # 点积
```

### （5）数组索引与切片
```python
a = np.array([[1, 2, 3], [4, 5, 6]])
print(a[0, 1])    # 取第一行第二列的元素，结果为2
print(a[:, 1])    # 取所有行的第二列，结果为[2 5]
```

### （6）数组变形
```python
a = np.arange(6)          # [0 1 2 3 4 5]
a = a.reshape((2, 3))     # 变成2行3列
```

### （7）随机数生成
```python
np.random.rand(2, 3)      # 2x3的0-1均匀分布随机数
np.random.randn(2, 3)     # 2x3的标准正态分布随机数
np.random.randint(0, 10, (2, 3))  # 0-9的随机整数
```

---

## 4. numpy 的优势

- **高效**：底层用 C 实现，运算速度远超原生 Python。
- **批量运算**：支持向量化操作，避免 for 循环，代码简洁高效。
- **兼容性强**：与 pandas、matplotlib、scipy 等科学计算库无缝集成。

---

## 5. 典型应用场景

- 数值计算与科学计算
- 数据预处理与特征工程
- 机器学习与深度学习底层数据操作
- 图像处理（像素矩阵）


# 下面是对 `matplotlib.pyplot` 的深入介绍：

---

## 1. matplotlib.pyplot 是什么？

`matplotlib.pyplot` 是 Python 最常用的数据可视化库 matplotlib 的一个子模块，提供了类似 MATLAB 的绘图 API。它可以用来绘制折线图、柱状图、散点图、直方图等多种常见图表。

---

## 2. 基本用法

### （1）导入
```python
import matplotlib.pyplot as plt
```

### （2）基本绘图流程
1. **准备数据**
2. **调用绘图函数**
3. **美化图表（可选）**
4. **显示图表**
   ```python
   plt.show()
   ```

---

## 3. 常见图表类型

### （1）折线图（Line Plot）
```python
x = [1, 2, 3, 4]
y = [10, 20, 15, 25]
plt.plot(x, y, marker='o', label='数据1')
plt.xlabel('X轴')
plt.ylabel('Y轴')
plt.title('折线图示例')
plt.legend()
plt.show()
```

### （2）散点图（Scatter Plot）
```python
plt.scatter(x, y, color='red')
plt.title('散点图示例')
plt.show()
```

### （3）柱状图（Bar Chart）
```python
labels = ['A', 'B', 'C']
values = [5, 7, 3]
plt.bar(labels, values)
plt.title('柱状图示例')
plt.show()
```

### （4）直方图（Histogram）
```python
import numpy as np
data = np.random.randn(1000)
plt.hist(data, bins=30, color='skyblue')
plt.title('直方图示例')
plt.show()
```

### （5）饼图（Pie Chart）
```python
sizes = [30, 40, 30]
labels = ['苹果', '香蕉', '橙子']
plt.pie(sizes, labels=labels, autopct='%1.1f%%')
plt.title('饼图示例')
plt.show()
```

---

## 4. 图表美化常用方法

- `plt.xlabel('X轴名称')`：设置X轴标签
- `plt.ylabel('Y轴名称')`：设置Y轴标签
- `plt.title('标题')`：设置图表标题
- `plt.legend()`：显示图例
- `plt.grid(True)`：显示网格线
- `plt.xlim([xmin, xmax])`、`plt.ylim([ymin, ymax])`：设置坐标轴范围
- `plt.savefig('figure.png')`：保存图片

---

## 5. 多图绘制

### （1）多子图（subplot）
```python
plt.subplot(1, 2, 1)  # 1行2列，第1个
plt.plot([1, 2, 3], [4, 5, 6])
plt.title('子图1')

plt.subplot(1, 2, 2)  # 1行2列，第2个
plt.bar(['A', 'B', 'C'], [3, 5, 2])
plt.title('子图2')

plt.tight_layout()
plt.show()
```

---

## 6. 典型应用场景

- 数据分析结果可视化
- 机器学习模型训练过程可视化（如损失曲线）
- 统计分析与报告展示

---

## 7. 与 pandas 配合

pandas 的 DataFrame 直接集成了 matplotlib 的绘图功能：
```python
import pandas as pd
df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
df.plot(kind='bar')
plt.show()
```

