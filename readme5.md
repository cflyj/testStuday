自我介绍
面试官您好，我叫李超凡，是西安邮电大学的一名应届毕业生。我在大一下加入了学校的工作室，并且从大二开始学习前端，先后学习了HTML、CSS、JavaScript和Vue框架。学习完这些技术栈以后，为了学以致用，做了一个音乐播放器项目和组件库项目，使用的技术栈主要有Vue, Ts, Vite 等；之后在去年11月份通过面试进入滴滴的商旅出行部进行了为期四个月的实习，主要参与了滴滴企业版用车板块的开发，H5月报和网约车的大盘看板。在今年四月份加入了百度的搜索产品部（增长运营）开始实习，主要负责手百运营活动的协同开发，在职的5个月内我主要参与了高考猜数字，搜有红包和ai音乐等5个大活动的开发，以及维护运营管理平台和移动端日常bug修复。

w平台
功能：将各专项数据模型识别的涉安全（/合规）线索快速接入并统一沉淀为“线索池”，支持事务同学打标与研判，并按可配置业务规则自动流转为调查服务（/案件）或按监管要求对外输出；我负责的是调整线索池功能，主要通过增加表单功能配合新增的业务线去拓展功能，围绕新增业务线引入动态表单与字段配置
组件改造
组件长列表数据过度造成页面卡顿添加虚拟列表
痛点：版本较低，少量数据的时候展示会异常列表不能正常展示，升级版本后问题解决，结合业务场景还是决定使用观察者模式实现的方式实现
IntersectionObserver观察者模式
IntersectionObserver 用于观察元素的可见性，即元素是否在视口中以及其进入或离开视口的情况。
使用场景：
- 实现懒加载图片或其他资源。
- 统计页面中的广告曝光率。
- 构建无限滚动（Infinite Scroll）列表。
代码示例：
const lazyImages = document.querySelectorAll('.lazy-load');

const options = {root: null, // 默认为视口rootMargin: '0px',threshold: 0.1 // 触发的阈值，表示元素可见部分达到10%
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {if (entry.isIntersecting) {const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img); // 加载完成后停止观察
    }
  });
}, options);
lazyImages.forEach(image => {
  observer.observe(image);
});
动态表单
自己填写传入json字段，前端解析json，根据type生成对应的表单
{ fd_key:fd_value:fd_name: type:fd_data:},用map遍历一遍type，set进去有哪些类型，再重新生成对应组件


后台业务配置
整体项目背景
难点
对于用户：前台产  品：一线运营、T2T3管理者、数据/策略产品等日常看数同学。
- 图表缺乏联动，联动看数效率低：需要多个图表来回切换、上下翻动看数，分析思路被打断；性能差，查询慢：在查询维度较多时，经常需要等好久，且有极大可能查询不出来；
- 对于数仓团队：配置后台：数仓+业务数据产品团队。
配置难度大：联动效果对图表配置能力、业务理解能力要求高；
配置成本高：需要做图表间维度的关联开发与配置；
经分析，该业务分析场景：普适性高、覆盖范围广、分析思路相对明确，价值较高。故与数仓及业务数据产品团队，共同归纳了一套该场景下，业务看数逻辑的专家方案——【大盘组合分析】模板。
模板适用场景：大盘场景、核心指标、简洁清爽的图表联动、组合分析。
收益
预估收益：前台产品：收敛大盘日常看数场景，设计前台具备联动能力的大盘组合分析模板。后台配置：支持展示内容的灵活配置。业务可以增加网约车的合理投放？增加gmv？
实际收益：借助该模板逐步替换UT侧/网约车大盘核心监控分析看板，数量：10+

配置后台
多张表单的方式创建后台配置，新增了两张表单，模态框业务和技术较为复杂。
封装多个hooks来简化相同的业务逻辑
业务难点：UI逻辑和业务逻辑的分离（说说hooks封装和树状结构生成，点到为止）
1. 抽屉池drawer需要用一个树状的结构来记录，一级已配置指标为核心指标比如新用户的gmv，二级指标为下钻指标比如：留存用户数，用户完单率，三级指标和四级指标可以自定义配置，每次切换lever+1且保存以前数据，封装了useDrawer的hooks包含UI逻辑，包含Drawer的添加，打开，自定义顺序和样式配置
2. getCheckList获取数据，必须一级节点，非一级节点需要挂载到父节点上。抽屉池需要提前定义node创建树状结构，方便数仓同学横向对比配置需要对比的数据，暴露treeData，addNode,deleteNode, updateNode,resetNodes,getNode, getLevelNodes的方法
3. 优化抽屉池交互体验，使用定时器控制开启时间，用usememo包含组件，使用useImperativeHandle 暴露方法
4. 优点：在通常情况下，React 的 ref 会直接指向一个 DOM 元素或组件的实例，但在某些情况下，你可能希望通过 ref 只暴露部分方法或状态，而不是整个 DOM 元素或组件实例
封装性: 通过 useImperativeHandle，你可以控制暴露给外部的接口，而不让父组件直接接触子组件的内部实现。这意味着父组件无法随意更改子组件的内部状态或方法，保持了组件的封装性。
隐藏实现细节: 你可以暴露一些简单的方法，而将复杂的逻辑隐藏在子组件内部。父组件不需要关心这些细节，只需要调用这些方法即可。
简化父组件代码: 父组件只需要知道如何调用暴露的方法，而不需要理解这些方法是如何实现的。这可以简化父组件的代码，减少对子组件内部实现的依赖，从而提高代码的可维护性。
隔离变更: 如果你需要修改子组件的内部实现，只要保持 useImperativeHandle 中暴露的方法接口不变，就可以避免对父组件的修改。这有助于减少组件间的耦合。


数据量大导致性能问题
当数据量较大时，Echarts图表的渲染速度会明显变慢，甚至导致页面卡顿。这是因为Echarts渲染每个数据点都需要一定的时间。网络请求 10 秒以上，图表渲染至少要 5 秒以上，渲染成功后用户操作卡顿、延迟还特别严重。
方案一：数据分段加载
1. 方案简介
随着数据量的增加，直接一次性加载所有数据可能导致页面性能下降和用户体验变差，因此考虑将数据分段加载也是一种常见的性能优化方案。
ECharts dataZoom 组件常用于区域缩放，从而让用户能自由关注细节的数据信息，或者概览数据整体，或者去除离群点的影响。为了能让 ECharts 避免一次性渲染的数据量过大，因此可以考虑使用 dataZoom 的区域缩放属性实现首次渲染 ECharts 图表时就进行区域渲染，减少整体渲染带来的性能消耗。
2. 实现步骤
dataZoom 组件提供了几个属性，利用这几个属性可以控制图表渲染时的性能问题，如下所示：
- start: 数据窗口范围的起始百分比。范围是：0 ~ 100。表示 0% ~ 100%。
- end: 数据窗口范围的结束百分比。范围是：0 ~ 100。
- minSpan: 用于限制窗口大小的最小值（百分比值），取值范围是 0 ~ 100。
- maxSpan: 用于限制窗口大小的最大值（百分比值），取值范围是 0 ~ 100。
具体方案是使用 start 和 end 控制 ECharts 图表初次渲染时滑块所处的位置以及数据窗口范围，使用 minSpan 和 maxSpan 用于限制窗口大小的最小值和最大值，最终限制的图表的可视区域显示范围，如下代码所示：
var option = {
  dataZoom: [
    {
      type: "slider",
      xAxisIndex: [0],
      start: 0,
      end: 1,
      minSpan: 0,
      maxSpan: 10,
    },
  ],
};

以上代码表示 ECharts 图表初始化时，数据窗口从 x 轴 0 ~ 1% 范围内显示，最大的窗口显示范围为 10%
3. 实际效果
通过配置 dataZoom 区域缩放组件，实现数据分段加载的实现方案，可以有效降低页面加载时间，减少资源占用，提升用户体验。大幅度减少一次性加载大数据量带来的性能压力，实现更加流畅的大规模数据可视化展示。
优点
可以很好的解决 ECharts 首次进行大数据量渲染造成的卡顿体验问题，不需要额外的数据处理，只需要通过简单的配置 dataZoom 缩放组件就可以实现
缺点
- 无法进行全局概览数据，只能分段查看数据
- 可能需要根据数据量动态的配置属性值，start、end、minSpan 和 maxSpan

 方案二：降采样策略
1. 方案简介
ECharts 还提供了另一种提高渲染性能的方式，那就是降采样策略 series-line.sampling，通过配置sampling采样参数可以告诉 ECharts 按照哪一种采样策略，可以有效的优化图表的绘制效率。
折线图在数据量远大于像素点时候的降采样策略，开启后可以有效的优化图表的绘制效率，默认关闭，也就是全部绘制不过滤数据点。
2. 实现步骤
sampling 属性提供了几个可选值，配置不同的值可以有效的优化图表的绘制效率，如下所示：
sampling 的可选值有以下几个：
- lttb: 采用 Largest-Triangle-Three-Bucket 算法，可以最大程度保证采样后线条的趋势，形状和极值。
- average: 取过滤点的平均值
- min: 取过滤点的最小值
- max: 取过滤点的最大值
- minmax: 取过滤点绝对值的最大极值 (从 v5.5.0 开始支持)
- sum: 取过滤点的和
具体方案是配置 series 的 sampling，最终表示使用的是 ECharts 的哪一种采样策略，ECharts 内部机制实现优化策略：
var option = {
  series: {
    type: "line",
    sampling: "lttb", // 最大程度保证采样后线条的趋势，形状和极值。
  },
};

以上代码表示使用 'lttb' 降采样策略，实现降低性能消耗的效果。
3. 实际效果
通过配置 series 的 sampling 为 lttb 模式，对比之前的曲线，可以最大程度保证采样后线条的趋势，形状和极值，如下图所示：
优点
- 使用简单，ECharts 内部降采样算法，效果显著
- 可以完整的将曲线趋势展示出来，和原曲线基本一致
缺点
- 并不是展示的所有点，会删除一些无用的点，保证渲染性能
- 最大程度保证采样后线条的趋势，形状和极值，但是某些情况下，极值有偏差，测试中发现
说明：本项目只使用了 lttb 和 minmax 这两种采样策略，相对比来说 lttb 有更流程的性能体验，但是测试中发现在一些情况下，极值出现偏差，也就是最大值最小值显示失误，但是使用 minmax 正常，原因未排查

 方案三：数据处理
- 数据聚合：对于特别密集的数据点，使用聚合算法在源头对数据降采样，进行数据聚合，减少渲染的数据点数量。
- 数据过滤：数据中存在一些无关的信息或数据噪音，服务端对数据进行过滤，只需要保留有用的数据即可，剔除无效的数据。
解决办法：
1、后端数据聚合。后端进行数据聚合，每次单个chart数据不超过2000。
2、前端交互、鼠标缩放、拖拽，根据时间，重新请求，整合更新数据。
图的性能优化
sampling的几个值
复制'lttb': 采用 Largest-Triangle-Three-Bucket 算法，
      可以最大程度保证采样后线条的趋势，形状和极值。
      不过有可能会造成页面渲染时间长
'average': 取过滤点的平均值
'min': 取过滤点的最小值
'max': 取过滤点的最大值
'minmax': 取过滤点绝对值的最大极值 (从 v5.5.0 开始支持)
'sum': 取过滤点的和
lttb算法优点：可以看见整体的趋势；
缺点：部分数据丢失；tooltip功能可能实现不了
使用 large 属性：largeThreshold 
复制series: [
  {
    data:backData.map(v=>v.value),
    type: 'line',
    smooth: true,
    //开启大数据量优化，在数据特别多而出现图形卡顿时候开启
    large:true,
  }


largeThreshold：开启绘制优化的阈值。
当数据量(即data长度)大于这个阀值的时候，会开启高性能模式。
低于这个阈值；不会开启高性能模式；
比如我们希望:数据量(即data长度)大于1万时开启高性能模式，你可以这样设置：
series: [
  {
    data:backData.map(v=>v.value),
    type:'bar',
    //开启大数据量优化，在数据特别多而出现图形卡顿时候开启
    large:true,
    // 数据量大于1万时开启高性能模式,如果没有大于1万;不会开启
    // 此时我们的数据是10万；会开启；渲染非常快
    largeThreshold: 10000,
  }
]
IvR机器人外呼系统的开发
新增兜底逻辑，用D3新增开发兜底音色，新增了矢量卡片
具体流程：兜底只有拒绝才能触发，创建class，封装一个卡片，constructor链接兜底逻辑。
兜底词库的拖拽：
在使用图表呈现一些数据的交互效果时，难免会有一些需要使用拖拽效果的需求。所以是有必要了解一下drag拖拽的方法。
1.D3.drap()
方法用来创建拖拽事件， d3.drag() 会返回一个drag方法，然后在使用selection.call()这个方法将返回的拖拽事件绑定到对应的元素上。
2.selection.call( )
前面我们知道，使用select.all（）可以获取到选择的元素的一个集合，selection.call(function[, arguments…]) 调用给定的函数一次，传入选集和可选的参数。返回这个选集。无论指定函数的返回值是什么，call操作符总是返回当前的选择，所以我们可以对选择的元素进行相关操作
3.拖拽事件的步骤：开始拖拽 drag.on(‘start’) ； 拖拽中 drag.on(‘dragged’) ; 拖拽结束 drag.on(‘end’)
const svg = d3.select(".qq").append("svg").attr("width", 700).attr("height", 400).style("border", "1px solid pink")

    // 模拟数据  这里采用比较简单的原点
    const dataList = [
        { 'r': 10, 'x': 80, y: 180, 'color': 'orange' },
        { 'r': 20, 'x': 150, y: 250, 'color': 'blue' },
        { 'r': 30, 'x': 85, y: 250, 'color': 'purple' },
        { 'r': 15, 'x': 323, y: 100, 'color': 'pink' },
        { 'r': 25, 'x': 500, y: 250, 'color': 'green' },
    ]

    // 绘制图形
    const circle = d3.select("svg")
        .selectAll("circle")
        .data(dataList)
        .join("circle")
        .attr("r", (d) => d.r)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("fill", (d) => d.color)
        .call(function (d) {
                  console.log(d)   // d代表circle元素的集合数组  可以对它进行操作
            console.log(this);   //这里的this指向是window
        })
        .call(name,'echo','john');  // 会给每一个函数添加对应的 名称
        function name(selection, first, last) {
        selection.attr("first-name", first).attr("last-name", last);
    }
       
soya开发管理系统
       用于为比赛准备的项目，前端由我负责，后端有另外一个同学负责。主要用于对后台管理人员的安排，主要有首页，看板，任务栏功能，顶部导航栏可以实现创建项目，登录和登出的功能。
Jwt
1. 使用jwt进行持久化登录
2. 用 tanstack-query 实现乐观更新
在网络情况不是很好的时候，为了提高用户体验可以使用“乐观更新”，即直接按用户意愿在请求成功之前更新本地缓存数据，若是请求失败则自动执行数据回滚
import { useProjectsSearchParams } from "screens/ProjectList/utils";
...
export const useEditProject = () => {
  const client = useHttp();
  const queryClient = useQueryClient();
  const [searchParams] = useProjectsSearchParams()
  const queryKey = ['projects', searchParams]
  return useMutation(
    (params: Partial<Project>) =>
      client(`projects/${params.id}`, {
        method: "PATCH",
        data: params,
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(queryKey),
      // async
      onMutate: (target) => {
        const previousItems = queryClient.getQueryData(queryKey)
        queryClient.setQueryData(queryKey, (old: Project[] = []) => {
          return old?.map(project => project.id === target.id ? { ...project, ...target } : project)
        })
        return {previousItems}
      },
      onError: (error, newItem, context) => {
        queryClient.setQueryData(queryKey, context?.previousItems)
      }
    }
  );
};

功能好使，但是发现这部分好多代码（useMutation 的第二参数）是可以复用的，接下来便提炼一个专门处理乐观更新的 hook

新建 src\utils\use-optimistic-options.ts：
import { QueryKey, useQueryClient } from 'react-query'

export const useConfig = (queryKey: QueryKey, callback: (target: any, old?: any[]) => any[]) => {
  const queryClient = useQueryClient()
  return {
    onSuccess: () => queryClient.invalidateQueries(queryKey),
    // async
    onMutate: (target: any) => {
      const previousItems = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old?: any[]) => callback(target, old))
      return {previousItems}
    },
    onError: (error: any, newItem: any, context: any) => {
      queryClient.setQueryData(queryKey, context?.previousItems)
    }
  }
}

两个重要的api createSlice和createAsyncThunk,前一个再里面写store，action，reducer（是链接store和action的桥梁，参数是state和payload），后一个管理封装好的axios来发送网络请求在组件中派发异步事件，dispatch = usedispatch,用useEffect，用useSelector从redux中获取数据。
二次封装axios
用了一个类把他封装起来，设置baseurl和请求时间,instance.interceptors.response设置相应拦截器，instance.interceptors.request.use来设置请求拦截器，封装基本的get post 方法。get方法拿到不到url参数下的数据，再用createAsyncThunk来异步发送网络请求（实际上是一个acition）
虚拟列表
当我们有成千上万条数据需要展示时，如果一次性创建所有dom元素后插入页面，可能会造成页面的卡顿，而虚拟列表则很好的优化了上述操作。
虚拟列表即利用巧妙的方法只渲染 可见区能渲染的最大条数 + bufferSize 个元素 ，并在滚动时动态的计算并更新每个元素中的内容从而达到一个长列表滚动的效果但花费更少的资源。
当我们滚动到一个元素离开可视区范围内时，就去掉上缓冲区顶上的一个元素，然后再下缓冲区增加一个元素。
定高虚拟列表
- 首先创建一个可以滚动的容器container，可以通过提前指定全部列表项的高度和或者通过添加一个占位元素(高度为当前所有列表项高度和)来达到可滚动的目的
- 获取可视区高度：height = window.innerHeight
- 获取item元素的高度 (设定好的)和item元素的总个数：itemSize、itemCount
- 计算可视区内所展示的元素个数 ： numVisible = Math.ceil(height / itemSize)
- 设置上下缓冲区所缓存的元素个数：bufferSize = 2
- 定义缓冲时的下标值 ： originStartIndex = 0
- 计算出可视区的起始索引：startIndex = Math.floor(scrollOffset / itemSize)
- 计算上缓冲区的起始索引以及下缓冲区的结束索引（就像上图滚动后，上缓冲区的起始索引为2，可视区起始索引为4，下缓冲区结束索引为9）finialStartIndex = Math.max(0, startIndex - 2) 
  endIndex = Math.min(itemCount, startIndex + numVisible + 2)
- 采用绝对定位，计算上缓冲区到下缓冲区之间的每一个元素在contianer中的top值，只有知道top值才能让元素出现在可视区内。
for (let i = finialStartIndex; i < endIndex; i++) {
      const itemStyle = {
        position: 'absolute',
        height: itemSize,
        width: '100%',
        // 计算每个元素在container中的top值
        top: itemSize * i,
      };
- 将上缓冲区到下缓冲区的元素塞到container中。
代码实现
import { useState, useEffect } from 'react';

const FixedSizeList = (props) => {
  const { height, width, itemSize, itemCount, children: Child } = props;
  // 记录滚动掉的高度
  const [scrollOffset, setScrollOffset] = useState(0);

  // 外部容器高度
  const containerStyle = {
    position: 'relative',
    width,
    height,
    overflow: 'auto',
  };
  
  useEffect(() => {
      getCurrentChildren（)
  }, [scrollOffset]);

  // 1000个元素撑起盒子的实际高度
  const contentStyle = {
    height: itemSize * itemCount,
    width: '100%',
  };
    
  const getCurrentChildren = () => {
    // 可视区起始索引
    const startIndex = Math.floor(scrollOffset / itemSize);
    // 上缓冲区起始索引
    const finialStartIndex = Math.max(0, startIndex - 2);
    // 可视区能展示的元素的最大个数
    const numVisible = Math.ceil(height / itemSize);
    // 下缓冲区结束索引
    const endIndex = Math.min(itemCount, startIndex + numVisible + 2);
    const items = [];
    // 根据上面计算的索引值，不断添加元素给container
    for (let i = finialStartIndex; i < endIndex; i++) {
      const itemStyle = {
        position: 'absolute',
        height: itemSize,
        width: '100%',
        // 计算每个元素在container中的top值
        top: itemSize * i,
      };
      items.push(
        <Child key={i} index={i} style={itemStyle} />
      );
    }
    return items;
  }

  // 当触发滚动就重新计算
  const scrollHandle = (event) => {
    const { scrollTop } = event.currentTarget;
    setScrollOffset(scrollTop);
  }

  return (
    <div style={containerStyle} onScroll={scrollHandle}>
       <div style={contentStyle}>
          {getCurrentChildren()}
       </div>
    </div>
  );
};

export default FixedSizeList;

不定高虚拟列表
每次只需要计算上缓冲区到下缓冲区之间的元素，并记录他们，并且记录下最底下的那个元素的索引，当用户进行滚动时，如果我们是向上滚动，就可以直接从已经计算好的记录里取，如果向下滚动，我们根据上一次记录的最大的索引的那个元素不断累加新元素的高度，直到它大于已经滚动掉的高度，此时的索引值就是可视区的起始索引了，这个起始索引所对应的top就是累加的高度。
关键
- 跟定高相比，困难在于不能根据元素的高度itemSize*元素索引index计算元素的top值了
- 对于不定高度的子列表，一般可以使用 预算高度 的方法来实现。即假定子列表的高度也就是虚拟高度
initItemHeight ，渲染完成后获得真实行高并进行更新和缓存 ，这样就可以解决子列表不定高度的问题 
- 每一个元素的top值都能通过上一个元素的top值 + 上一个元素的height计算出来
- 关键在于维护一个记录对象
  
const measuredData = {
  measuredDataMap: {},
  LastMeasuredItemIndex: -1,
};
  记录已经计算过的列表项的offset和高度size和上次更新的计算过的列表项的索引LastMeasuredItemIndex，并且实时更新
- 首先思路也是先获取所有列表项的高度之和撑起container，不同的是将高度分为 已经计算过的列表项高度之和measuredHeight = lastMeasuredItem.offset * lastMeasuredItem.size+未计算过高度的列表项个数 * 估计列表项高度
- 根据索引判断，如果当前索引大于最后记录的列表项索引，就计算当前索引对应列表项的offset和size，并且更新measuredData记录
- 计算startIndex：直到当前索引值对应的记录的offset大于已经滚动掉的高度scrollHeight，此时的索引值就是可视区的起始索引了，这个起始索引所对应的top就是当前记录累加的高度
- 计算endIndex：获取到可视区中startIndex后，计算当前可视区的最大offset，即startIndex对应的列表项的offset+视口高度height，不断累加offset的值，直到offset大于或等于maxOffset或者index加到最大，对应的index即为endIndex
- 计算缓冲区开始和结束索引
      Math.max(0, startIndex - 2) Math.min(itemCount - 1, endIndex + 2)
- 遍历从startIndex到endIndex之间的所有列表项，并为其添加top样式
- 监听滚动事件，不断更新scrollHeight，不断进行计算
import { useState } from 'react';

// 元数据
const measuredData = {
  measuredDataMap: {},
  LastMeasuredItemIndex: -1,
};

const estimatedHeight = (defaultEstimatedItemSize = 50, itemCount) => {
  let measuredHeight = 0;
  const { measuredDataMap, LastMeasuredItemIndex } = measuredData;
  // 计算已经获取过真实高度的项的高度之和
  if (LastMeasuredItemIndex >= 0) {
    const lastMeasuredItem = measuredDataMap[LastMeasuredItemIndex];
    measuredHeight = lastMeasuredItem.offset + lastMeasuredItem.size;
  }
  // 未计算过真实高度的项数
  const unMeasuredItemsCount = itemCount - measuredData.LastMeasuredItemIndex - 1;
  // 预测总高度
  const totalEstimatedHeight = measuredHeight + unMeasuredItemsCount * defaultEstimatedItemSize;
  return totalEstimatedHeight;
}

const getItemMetaData = (props, index) => {
  const { itemSize } = props;
  const { measuredDataMap, LastMeasuredItemIndex } = measuredData;
  // 如果当前索引比已记录的索引要大，说明要计算当前索引的项的size和offset
  if (index > LastMeasuredItemIndex) {
    let offset = 0;
    // 计算当前能计算出来的最大offset值
    if (LastMeasuredItemIndex >= 0) {
      const lastMeasuredItem = measuredDataMap[LastMeasuredItemIndex];
      offset += lastMeasuredItem.offset + lastMeasuredItem.size;
    }
    // 计算直到index为止，所有未计算过的项
    for (let i = LastMeasuredItemIndex + 1; i <= index; i++) {
      const currentItemSize = itemSize(i);
      measuredDataMap[i] = { size: currentItemSize, offset };
      offset += currentItemSize;
    }
    // 更新已计算的项的索引值
    measuredData.LastMeasuredItemIndex = index;
  }
  return measuredDataMap[index];
};

const getStartIndex = (props, scrollOffset) => {
  const { itemCount } = props;
  let index = 0;
  while (true) {
    const currentOffset = getItemMetaData(props, index).offset;
    if (currentOffset >= scrollOffset) return index;
    if (index >= itemCount) return itemCount;
    index++
  }
}

const getEndIndex = (props, startIndex) => {
  const { height, itemCount } = props;
  // 获取可视区内开始的项
  const startItem = getItemMetaData(props, startIndex);
  // 可视区内最大的offset值
  const maxOffset = startItem.offset + height;
  // 开始项的下一项的offset，之后不断累加此offset，直到等于或超过最大offset，就是找到结束索引了
  let offset = startItem.offset + startItem.size;
  // 结束索引
  let endIndex = startIndex;
  // 累加offset
  while (offset <= maxOffset && endIndex < (itemCount - 1)) {
    endIndex++;
    const currentItem = getItemMetaData(props, endIndex);
    offset += currentItem.size;
  }
  return endIndex;
};

const getRangeToRender = (props, scrollOffset) => {
  const { itemCount } = props;
  const startIndex = getStartIndex(props, scrollOffset);
  const endIndex = getEndIndex(props, startIndex);
  return [
    Math.max(0, startIndex - 2),
    Math.min(itemCount - 1, endIndex + 2),
    startIndex,
    endIndex,
  ];
};

const VariableSizeList = (props) => {
  const { height, width, itemCount, itemEstimatedSize, children: Child } = props;
  const [scrollOffset, setScrollOffset] = useState(0);

  const containerStyle = {
    position: 'relative',
    width,
    height,
    overflow: 'auto',
    willChange: 'transform'
  };

  const contentStyle = {
    height: estimatedHeight(itemEstimatedSize, itemCount),
    width: '100%',
  };

  const getCurrentChildren = () => {
    const [startIndex, endIndex, originStartIndex, originEndIndex] = getRangeToRender(props, scrollOffset)
    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const item = getItemMetaData(props, i);
      const itemStyle = {
        position: 'absolute',
        height: item.size,
        width: '100%',
        top: item.offset,
      };
      items.push(
        <Child key={i} index={i} style={itemStyle} />
      );
    }
    return items;
  }

  const scrollHandle = (event) => {
    const { scrollTop } = event.currentTarget;
    setScrollOffset(scrollTop);
  }

  return (
    <div style={containerStyle} onScroll={scrollHandle}>
      <div style={contentStyle}>
        {getCurrentChildren()}
      </div>
    </div>
  );
};

export default VariableSizeList;



路由懒加载
随着SPA的发展，网页相关资源体积也越来越大，路由懒加载(动态加载)就是一种常用的优化方案，用于代码分离，优化资源体积
使用
React.lazy()
1. 接受一个函数作为参数，这个函数需要调用import()。
2. React.lazy 方法返回的是一个lazy组件的对象，类型是react.lazy，并且 lazy 组件具有 _status 属性。并且与 promise 类似，有 Pending，Resolved，Rejected 三个状态，分别代表组件的加载中，已加载、加载失败三个状态。
3. 需要配合Suspence组件一起使用，在Suspence中渲染异步加载的组件
实现原理
Suspense 组件
Suspense 内部主要通过捕获组件的状态去判断如何加载,React.lazy创建的动态加载组件具有Pending，Resolved，Rejected三种状态，当这个组件的状态为Pending时显示的是 Suspense 中fallback 的内容，只有状态变为 Resolved 才会显示组件。

文件分片上传和断点续传
总结
1. 首先前端需要做到的是获取input标签拿到的文件，对该文件进行切片，但因为是大文件，如果我们在js主线程中执行切片工作，那么可能会导致页面卡顿甚至崩溃，于是我们将切片工作交给了web Worker，这是HTML5 中提出的概念，分为两种类型，专用线程（Dedicated Web Worker） 和共享线程（Shared Web Worker）。专用线程仅能被创建它的脚本所使用（一个专用线程对应一个主线程），而共享线程能够在不同的脚本中使用（一个共享线程对应多个主线程）。
2. 在这里我们使用的是专用线程，我们通过new关键字创建一个worker线程，在线程再通过worker.postMessage(file, size)将文件内容，和固定的分片大小传给worker线程。
3. 并且在worker线程的文件分片过程中，我们同时导入第三方库spark-MD5为该文件生成一个专属于该文件的一个hash值。
4. 在worker线程中，我们首先计算出文件根据分片固定大小被分成多少给分片，还需要new一个FileReader对象，通过递归先使用Blob对象的slice()方法来对文件依次分片，最后我们使用FileReader的readAsArrayBuffer方法收集分片，递归的结束条件是递归次数即分片次数等于计算出应有的分片数量，我们首先调用SparkMD5.ArrayBuffer()的实例上的end方法，生成文件的hash值。接着我们就可以向主线程发送消息，消息内容包括{ fileHash, fileReader }即文件的hash值，和文件的分片。
5. 在拿到切片和md5哈希值以后，我们首先去服务器查询一下，是否已经存在当前文件。
  1. 如果已存在，并且已经是上传成功的文件，则直接返回前端上传成功，即可实现"秒传"。
  2. 如果已存在，但是有一部分切片上传失败，则返回给前端已经上传成功的切片name，前端拿到后，根据返回的切片，计算出未上传成功的剩余切片，然后把剩余的切片继续上传，即可实现"断点续传"。
  3. 如果不存在，则开始上传，这里需要注意的是，在并发上传切片时，需要控制并发量，避免一次性上传过多切片，导致崩溃。
文件切片上传的整体思路
前端大文件上传核心是利用 Blob.prototype.slice 方法，和数组的 slice 方法相似，文件的 slice 方法可以返回原文件的某个切片。
预先定义好单个切片大小，将文件切分为一个个切片，然后借助 http 的可并发性，同时上传多个切片。这样从原本传一个大文件，变成了并发传多个小的文件切片，可以大大减少上传时间。
另外由于是并发，传输到服务端的顺序可能会发生变化，因此我们还需要给每个切片记录顺序
切片上传的流程
- 对文件进行切片
- 将切片文件传输给服务端
//创建分片，固定分片大小
function creatChunk(file, size = 2 * 1024 * 1024) {
    //收集分片
    const chunk = [];
    let cur = 0;
    while (cur <= files.size) {
        chunk.push({
            file: files.slice(cur, cur + size)//调用slice函数进行切片
        });
        cur += size;
    }
    return chunk;
}
// 监听上传点击事件
upload.addEventListener('click', e => {
    // 切片上传,将每一个分片打包为一个文件名 + index的数据包
    const uploadList = chunks.map(({ file }, index) => ({
        file,
        size: file.size,
        precent: 0,
        chunkName: ${files.name}-${index},
        fileName: files.name,
        index
    }))
    uploadFile(uploadList)
})
// 上传所有分片
function uploadFile(list) {
    // 处理分片
    const requestList = list.map(({ chunkName,file, fileName,index}) => {
        let formData = new FormData();
        // 将每一个分片打包成一个FormData对象传给后台
        formData.append('file', file); 
        formData.append('fileName', fileName);
        formData.append('chunkName', chunkName);
        return { formData, index }
    })
    .map(({ formData }) =>
          this.request({
                url: "http://localhost:3000",
                data: formData
          })
    );
}
利用worker线程进行文件切片并通过调用库 spark-md5计算出文件的 hash 值
然而这里就存在一个问题，如果文件体积特别大的话，对文件进行分片的过程中会造成页面的卡顿。众所周知，js是单线程模型，如果这个计算过程在主线程中的话，那我们的页面必然会直接崩溃，这时，就该 Web Worker 来上场了。
Web Worker 的作用，就是为 JavaScript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。具体的作用，不了解的同学可以自行去学些一下。这里就不展开讲了。
// 主线程的内容
// 创建一个worker对象
const worker = new worker('worker.js')
// 向子线程发送消息，并传入文件对象和切片大小，开始计算分割切片
worker.postMessage(file, size)

// 子线程计算完成后，会将切片返回主线程
worker.onmessage = (chunks) => {
    ...
}
Worker子线程：
// 导入脚本
self.importScripts("/spark-md5.min.js");
// 生成文件 hash
// 接收文件对象及切片大小
onmessage (file, size) => {
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
      chunks = Math.ceil(file.size / size),
      currentChunk = 0,
      spark = new SparkMD5.ArrayBuffer(),
      fileReader = new FileReader();
    fileReader.onload = function (e) {
          console.log('read chunk nr', currentChunk + 1, 'of');
          const chunk = e.target.result;
          spark.append(chunk);
          currentChunk++;

          if (currentChunk < chunks) {
              //只要当前分片的数量小于文件应有的分片数量，那么就继续执行loadNext()
              loadNext();
          } else {
              // 当递归完所有的文件切片后，调用spark.end()生成这个文件的hash值
              let fileHash = spark.end();
              console.info('finished computed hash', fileHash);
              // 此处为重点，计算完成后，仍然通过postMessage通知主线程，将hash值和文件切片传给主线程
              postMessage({ fileHash, fileReader })
              self.close();
          }
    };
    fileReader.onerror = function () {
        console.warn('oops, something went wrong.');
    };
    function loadNext() {
          let start = currentChunk * size,
            end = ((start + size) >= file.size) ? file.size : start + size;
          let chunk = blobSlice.call(file, start, end);
          fileReader.readAsArrayBuffer(chunk);
    }
    loadNext();
}
在 worker 线程中，接受文件切片 fileChunkList，利用 fileReader 读取每个切片的 ArrayBuffer 并不断传入 spark-md5 中，每计算完一个切片通过 postMessage 向主线程发送一个进度事件，全部完成后将最终的 hash 发送给主线程。
断点续传
在拿到切片和md5后，我们首先去服务器查询一下，是否已经存在当前文件。
1. 如果已存在，并且已经是上传成功的文件，则直接返回前端上传成功，即可实现"秒传"。
2. 如果已存在，并且有一部分切片上传失败，则返回给前端已经上传成功的切片name，前端拿到后，根据返回的切片，计算出未上传成功的剩余切片，然后把剩余的切片继续上传，即可实现"断点续传"。
3. 如果不存在，则开始上传，这里需要注意的是，在并发上传切片时，需要控制并发量，避免一次性上传过多切片，导致崩溃。
// 检查是否已存在相同文件
async function checkAndUploadChunk(chunkList, fileMd5Value) {
    const requestList = []
    // 如果不存在，则上传
    for (let i = 0; i < chunkList; i++) {
        requestList.push(upload({ chunkList[i], fileMd5Value, i }))
    }

    // 并发上传
    if (requestList?.length) {
        await Promise.all(requestList)
    }
}

// 上传chunk
function upload({ chunkList, chunk, fileMd5Value, i }) {
    current = 0
    let form = new FormData()
    form.append("data", chunk) //切片流
    form.append("total", chunkList.length) //总片数
    form.append("index", i) //当前是第几片    form.append("fileMd5Value", fileMd5Value)
    return axios({
        method: 'post',
        url: BaseUrl + "/upload",
        data: form
    }).then(({ data }) => {
        if (data.stat) {
          current = current + 1
          // 获取到上传的进度
          const uploadPercent = Math.ceil((current / chunkList.length) * 100)
        }
    })
}
