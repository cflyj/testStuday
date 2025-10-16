AI code
1.1视觉
cosmic D2C:
仅供生成页面大体框架，样式还原度一般，后续调整视觉样式，补充交互逻辑
demo
生成代码
具体效果
一分购邀请记录模块
结果较为清晰：
——头部
————标题
——————主标题
——————副标题
————按钮
——邀请列表
页面结构基本正确，数据结构mock较为简单，尺寸不对（3倍），滚动未实现，色值不对，需重新调整


[图片]

[图片]
1.2 交互
prompt
zulu
deepseak
区分
js写一个退场逻辑，支持一次展现活动期间退场，连续七天内无点击活动期间退场，区分活动期
我已创建了活动退场逻辑控制器，主要功能包括：
1. 记录活动展示：通过recordImpression方法记录活动首次展示时间
2. 记录用户点击：通过recordClick方法更新最后点击时间
3. 退场条件判断：
- 活动期内退场（30天内）
- 7天无点击退场（仅活动期内有效）
使用方法示例：
// 活动展示时调用
ExitController.recordImpression('promo_2023');


// 用户点击活动时调用 
ExitController.recordClick('promo_2023');


// 检查是否需要退场
if (ExitController.shouldExit('promo_2023')) {
  // 执行退场逻辑
}
该实现使用了localStorage持久化存储活动数据，确保用户关闭浏览器后数据不会丢失。您可以在src/mkt/static/mkt_common/exit.ts查看完整实现。
需要我进一步解释任何部分或做其他调整吗？
功能说明
1. 活动期间判断：isInActivityPeriod() 方法确保只在活动期间应用退场逻辑
2. 两种退场逻辑：
- 一次性展现退场：用户只要展现过活动内容即退场
- 连续7天无点击退场：用户最后一次点击活动后超过7天未互动则退场
1. 行为记录：
- recordImpression() 记录用户展现
- recordClick() 记录用户点击
1. 退场检查：
- shouldExitAfterFirstImpression() 检查一次性退场
- shouldExitAfterSevenDaysNoClick() 检查7天无点击退场
- shouldExit() 综合检查两种退场逻辑
zulu使用了localStorage持久化存储活动数据
deepseak 数据存储在应用运行时
追加prompt：每期活动用时间区分，无 id
我已完成了退场逻辑的实现，现在总结如下：
1. 实现了一个基于时间自动分期的活动退场控制器
2. 主要功能包括：
- 自动按周划分活动期（如activity_2023_45表示2023年第45周的活动）
- 记录活动展示和点击时间
- 支持两种退场条件判断：
- 活动期内退场（默认30天）
- 连续7天无点击退场
主要改进
1. 无ID设计：使用活动时间段(start_end)作为自然键区分不同期活动
2. 自动活动识别：
- getCurrentActivityKey()自动找到当前有效的活动
- 行为记录和退场检查无需指定活动ID
1. 智能数据清理：
- cleanupExpiredActivities()自动清理过期活动数据
- 可配置保留最近N个活动的数据
1. 简化API：
- 用户行为记录和退场检查只需用户ID和日期
- 自动关联到正确的活动期
zulu 自动按周生成活动期标识，且退场点击未自动匹配当前周期，不够灵活


deepseak 支持用户传入周期，更加灵活，退场行为自动匹配周期
js 实现一个退场逻辑
1. 核心功能：
- 支持两种退场机制：
- 单次展现即退场（适用于强曝光场景）
- 连续7天无交互退场（适用于留存场景）
1. 数据存储：
- 使用localStorage持久化存储
- 按活动周期自动隔离数据
1. 活动周期管理：
- 自动生成周期标识
- 支持默认周期（未配置时使用）
- 时间匹配规则：当前时间匹配活动周期
1. 内容隔离：
- 同一周期内不同内容独立计算退场
- 内容标识(contentId)由调用方传入
1. 自动化能力：
- 自动匹配当前有效周期
- 自动清理过期周期数据（可配置保留数量）
实现特点：
- 未指定周期时使用"default"作为默认周期
- 自动生成活动期标识（基于开始时间的年月）
- 精确匹配当前时间所在活动期
- 每个内容独立维护展现和点击时间
- 所有数据存储在localStorage中
- 简洁清晰的API设计




/**
- 活动退场逻辑控制器
*/
class ExitController {
  private static readonly STORAGE_KEY = 'activity_exit_data';
  private readonly period: string;
  private readonly startTime: number;
  private readonly endTime: number;

  /**
- 构造函数
- @param options 配置选项
- @param options.startTime 活动开始时间戳（毫秒，可选）
- @param options.endTime 活动结束时间戳（毫秒，可选）
*/
constructor(options: {
startTime?: number;
endTime?: number;
} = {}) {
this.startTime = options.startTime || 0;
this.endTime = options.endTime || Infinity;
this.period = options.startTime
 ? ExitController.generatePeriodId(options.startTime)
 : 'default';

    this.initStorage();
  }

  private initStorage(): void {
    const data = ExitController.getStorageData();
    data[this.period] = {
      startTime: this.startTime,
      endTime: this.endTime,
      contents: data[this.period]?.contents || {}
    };
    ExitController.saveStorageData(data);
  }

  /**
- 记录内容展示
- @param contentId 内容标识
*/
recordImpression(contentId: string): void {
const data = ExitController.getStorageData();
data[this.period].contents[contentId] = {
 ...data[this.period].contents[contentId],
 lastImpressionTime: Date.now()
};
ExitController.saveStorageData(data);
}

  /**
- 记录内容点击
- @param contentId 内容标识
*/
recordClick(contentId: string): void {
const data = ExitController.getStorageData();
data[this.period].contents[contentId] = {
 ...data[this.period].contents[contentId],
 lastClickTime: Date.now()
};
ExitController.saveStorageData(data);
}

  /**
- 检查内容是否需要退场
- @param contentId 内容标识
- @returns 是否需要退场
*/
shouldExit(contentId: string): boolean {
const data = ExitController.getStorageData();
const activity = data[this.period];
const content = activity?.contents[contentId];
const now = Date.now();

    // 活动期间退场条件
    const condition1 = now >= this.startTime && now <= this.endTime;

    // 7天无点击退场条件
    const condition2 = content?.lastClickTime
      ? now - content.lastClickTime > 7 * 24 * 60 * 60 * 1000
      : false;

    return condition1 || condition2;
  }

  // 静态工具方法
  private static generatePeriodId(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return act_${year}_${month};
  }

  private static getStorageData(): Record<string, {
    startTime: number;
    endTime: number;
    contents: Record<string, {
      lastImpressionTime?: number;
      lastClickTime?: number;
    }>;
  }> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private static saveStorageData(data: any): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
}

export default ExitController;




classExitLogic{
/**
*@param{Object} options 配置项
*@param{string} options.defaultPeriod 默认周期key（不传活动期时使用）
*@param{number} options.clickExpireDays 点击有效期（默认7天）
*/
constructor(options ={}){
this.config ={
      defaultPeriod:'default',
      clickExpireDays:7,
...options
};
this.STORAGE_KEY='exit_logic_data';
this.initStorage();
}

// 初始化存储空间
initStorage(){
if(!localStorage.getItem(this.STORAGE_KEY)){
      localStorage.setItem(this.STORAGE_KEY,JSON.stringify({}));
}
}

/**
- 获取当前数据存储
*@returns{Object}
*/
getStorageData(){
returnJSON.parse(localStorage.getItem(this.STORAGE_KEY))||{};
}

/**
- 更新存储数据
*@param{Object} data 
*/
updateStorage(data){
    localStorage.setItem(this.STORAGE_KEY,JSON.stringify(data));
}

/**
- 根据时间自动计算周期key
*@param{number} startTime 活动开始时间戳（ms）
*@param{number} endTime 活动结束时间戳（ms）
*@returns{string} 周期key格式：period_${startTime}_${endTime}
*/
generatePeriodKey(startTime, endTime){
returnperiod_${startTime}_${endTime};
}

/**
- 获取当前应该使用的周期key
*@param{number}[startTime] 活动开始时间
*@param{number}[endTime] 活动结束时间
*@returns{string}
*/
getCurrentPeriodKey(startTime, endTime){
if(!startTime ||!endTime)returnthis.config.defaultPeriod;

const now = Date.now();
if(now >= startTime && now <= endTime){
returnthis.generatePeriodKey(startTime, endTime);
}
returnthis.config.defaultPeriod;
}

/**
- 记录内容退场
*@param{string} contentId 内容ID
*@param{Object}[period] 活动周期
*@param{number} period.startTime 开始时间戳
*@param{number} period.endTime 结束时间戳
*/
recordExit(contentId, period ={}){
const periodKey =this.getCurrentPeriodKey(period.startTime, period.endTime);
const storage =this.getStorageData();

// 初始化周期数据
if(!storage[periodKey]){
      storage[periodKey]={
        contents:{},
        lastClickTime:0
};
}

// 记录退场（不覆盖已有记录）
if(!storage[periodKey].contents[contentId]){
      storage[periodKey].contents[contentId]={
        exitTime: Date.now(),
        isClicked:false
};
this.updateStorage(storage);
}
}

/**
- 记录内容点击
*@param{string} contentId 内容ID
*/
recordClick(contentId){
const storage =this.getStorageData();
let needUpdate =false;

// 遍历所有周期更新点击状态
for(const periodKey in storage){
if(storage[periodKey].contents[contentId]){
        storage[periodKey].contents[contentId].isClicked =true;
        storage[periodKey].lastClickTime = Date.now();
        needUpdate =true;
}
}

if(needUpdate)this.updateStorage(storage);
}

/**
- 检查内容是否应该退场
*@param{string} contentId 内容ID
*@param{Object}[period] 活动周期
*@returns{boolean}true表示应该退场
*/
shouldExit(contentId, period ={}){
const periodKey =this.getCurrentPeriodKey(period.startTime, period.endTime);
const storage =this.getStorageData();
const periodData = storage[periodKey];

// 默认周期或未记录的内容直接不退场
if(!periodData ||!periodData.contents[contentId]){
returnfalse;
}

const contentData = periodData.contents[contentId];
const now = Date.now();
const clickExpireMs =this.config.clickExpireDays *24*60*60*1000;

// 退场条件判断
return(
// 条件1：当前不在活动期内且曾经退场过
(periodKey ===this.config.defaultPeriod && contentData.exitTime)||
// 条件2：7天内无点击
(now - periodData.lastClickTime > clickExpireMs)
);
}

/**
- 清除指定周期的数据
*@param{Object}[period] 活动周期
*/
clearPeriodData(period ={}){
const periodKey =this.getCurrentPeriodKey(period.startTime, period.endTime);
const storage =this.getStorageData();

if(storage[periodKey]){
delete storage[periodKey];
this.updateStorage(storage);
}
}
}
完善的逻辑清晰的prompt，使得code 生成更高效，更满足；
1. 明确目的
2. 结构化






talos-pv-mcp
1. 名称：talos-pv
2. 描述：根据传入最近天数，查询最近几天的talos组件 流量
3. 入参：recentDays: z.number().describe("最近天数")


项目介绍
1. 项目背景介绍
"我开发了一个基于Model Context Protocol (MCP) 的工具，用于查询百度内部Talos系统的弹窗曝光数据。这个工具主要是为了帮助产品和运营同事更方便地获取各种营销弹窗的PV数据。"
2. 技术架构亮点
技术栈：
- 使用MCP SDK构建，这是一个相对新兴的协议标准
核心技术特点：
- MCP协议集成：这是一个先进的模型上下文协议，说明你关注新技术趋势
- 批量请求优化：实现了分批处理机制，避免并发过多造成服务器压力
- 异步编程：使用Promise.all进行并发控制，提高查询效率
- 错误处理：完善的错误捕获和状态管理
3. 业务价值
- 数据源整合：支持查询140+种不同类型的营销弹窗数据
- 时间维度灵活：可以查询最近N天的历史数据
- 数据导出：自动生成按日期分组的txt文件，方便数据分析
- 提升效率：将原本需要手动查询的工作自动化
4. 面试时可以强调的点
技术深度：
- "我选择MCP协议是因为它代表了AI时代工具集成的新方向"
- "实现了生产级的错误处理和性能优化"
- "使用TypeScript确保代码质量和可维护性"
业务思维：
- "这个工具解决了运营团队每天都要面对的重复性工作"
- "支持灵活的时间查询，满足不同分析需求"
- "数据导出功能让后续的Excel分析变得更简单"
工程能力：
- "考虑了并发控制，避免对生产环境造成影响"
- "项目结构清晰，易于维护和扩展"
- "完整的构建流程，可以直接部署使用"
这个项目展示了你在新技术探索、性能优化、业务理解等多个方面的能力，是一个很好的面试加分项！

5. 技术难点与解决方案
挑战1：大量并发请求的性能优化，批量请求优化
- 问题：140+个弹窗同时请求会造成服务器压力
- 解决：实现分批处理（batchSize=n）+ 延迟机制（500ms间隔）避免服务器压力
```JavaScript
分批处理: 140+请求分成多批，避免同时发起过多请求
批内并发: 每批内使用Promise.all并发执行
批间串行: 批与批之间串行执行，加入500ms延迟
进度监控: 实时显示处理进度

async function batchFetchRequests({ names, batchSize = 5, recentDays = 1 }) {
    for (let i = 0; i < names.length; i += batchSize) {
        // 分批处理：每批处理batchSize个请求
        const batch = names.slice(i, i + batchSize);
        
        // 批内并发：同时发起batch内的所有请求
        const batchPromises = batch.map(name => fetchPopupData({
            popupName: name,
            recentDays
        }));
        
        // 等待当前批次完成
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // 进度显示
        console.log(`已完成 ${Math.min(i + batchSize, names.length)}/${names.length}`);

        // 批间延迟：避免服务器压力
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}```
挑战2：Cookie管理和认证
- 问题：需要处理百度内部系统的身份认证
- 解决：集成完整的Cookie字符串，保证API调用权限
```JavaScript
// 完整的Cookie字符串管理
const cookies = 'UUAP_TRACE_TOKEN=1a38310555a45b8b8dc6d58b731e8ed1; BIDUPSID=63da41daa528919a4fa330c22377d954; UUAP_TRACE_TOKEN_OFFLINE=1a38310555a45b8b8dc6d58b731e8ed1; PSTM=1748493857; MAWEBCUID=web_PbeIIDFqSmqpWiVdjuqOWkuLHCnblEmMgopGwWgjBLgjSrFKxG; BDUSS=UtYTTZkMGpKTH50UFZKNEhsMUIzQmZocExUMDhDaDg1ZTdLNXJxa1d1dX5BNXhvRVFBQUFBJCQAAAAAAAAAAAEAAACb9QGpMTU3MTcwNzg3MzlmdwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL92dGi~dnRoT; BDUSS_BFESS=UtYTTZkMGpKTH50UFZKNEhsMUIzQmZocExUMDhDaDg1ZTdLNXJwa1d1dX5BNXhvRVFBQUFBJCQAAAAAAAAAAAEAAACb9QGpMTU3MTcwNzg3MzlmdwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL92dGi~dnRoT; delPer=0; UUAP_P_TOKEN=PT-1154799989997064194-23fd24deb894ee100c777726b53b397377f5b92def44b6b419aa27c9e6de2a76-uuapenc; SECURE_UUAP_P_TOKEN=PT-1154799989997064194-faWGZ8KzN0ZvEppAMj77-uuap; ...';

async function fetchPopupData({ popupName, recentDays = 1 }) {
    // API请求参数构建
    const params = {
        productId: '4',
        moduleId: '85',
        type: 'count',
        groupname: 'talosEggPopup',
        timeLevel: 'day',
        filter: JSON.stringify({ popupName }),
        startTime: startTime.toString(),
        endTime: endTime.toString()
    };
    
    const paramsStr = new URLSearchParams(params).toString();
    const url = `https://spy.baidu.com/api/count/trend?${paramsStr}`;
    
    try {
        res = await fetch(url, {
            method: 'GET',
            headers: {
                'Cookie': cookies,  // 关键：使用完整Cookie进行认证
            }
        }).then(res => res.json()).then(data => {
            return {
                popupName,
                success: true,
                allData: data.data.series[0],
                pv: data.data.series[0].yData[0] || 0,
            };
        })
    } catch (err) {
        return {
            popupName,
            success: false,
            error: err.message,
        };
    }
}```
挑战3：数据格式标准化
- 问题：不同接口返回格式不统一
- 解决：统一的数据结构设计，包含success状态、错误信息等
```JavaScript
// 统一的返回数据结构设计
async function fetchPopupData({ popupName, recentDays = 1 }) {
    try {
        res = await fetch(url, {
            method: 'GET',
            headers: { 'Cookie': cookies }
        }).then(res => res.json()).then(data => {
            // 成功情况：标准化数据结构
            return {
                popupName,           // 弹窗名称
                success: true,       // 成功状态
                allData: data.data.series[0],  // 完整数据
                pv: data.data.series[0].yData[0] || 0,  // PV值
            };
        })
    } catch (err) {
        // 失败情况：统一错误格式
        return {
            popupName,
            success: false,      // 失败状态
            error: err.message,  // 错误信息
        };
    }
    return res;
}

// 结果分析和处理
async function taskFn(recentDays) {
    await batchFetchRequests({ names: popupNames, batchSize: 100, recentDays });

    // 基于标准化结构进行数据分析
    const successfulRequests = results.filter(r => r.success);
    const failedRequests = results.filter(r => !r.success);

    console.log(`成功: ${successfulRequests.length} 个`);
    console.log(`失败: ${failedRequests.length} 个`);

    if (failedRequests.length > 0) {
        console.log('失败的请求:', failedRequests);
    }
    
    //在代码头先引入fs模块
    //const fs= __importDefault(require("fs"));

    // 数据导出：按日期维度组织
    const dates = results[0]?.allData?.xData || [];
    dates.forEach((date, index) => {
        const pv = results.map(result => result.allData?.yData[index] || 0).join('\n');
        //写入文件
        fs.writeFileSync(path.join(__dirname, `${date}.txt`), pv);
    });
    
    //// 每个弹窗的查询结果格式
    /*{
        popupName: "MktRedpacketPro",
        success: true,
        allData: {
            xData: ["2024-01-01", "2024-01-02", "2024-01-03"],  // 日期数组
            yData: [1200, 1500, 800]                            // 对应的PV数组
        },
        pv: 1200  // 第一天的PV值
    }*/

    return results;
}```
6. 项目结构说明
```Plain Text
talos_pv_mcp/
├── src/index.ts        # 核心逻辑：MCP服务器 + 数据查询
├── build/index.js      # 编译后的可执行文件
├── package.json        # 依赖管理
└── tsconfig.json       # TypeScript配置```
1. 


Mcp服务器实现
```JavaScript
// 创建MCP服务器
const server = new McpServer({
    name: "talosPv",
    version: "1.0.1",
    capabilities: {
        resources: {},
        tools: {},
    },
});

// 注册工具
server.tool(
    'talos-pv',                    // 工具名称
    '根据传入最近天数，查询最近几天的流量数据', // 工具描述
    {
        recentDays: z.number().describe("最近天数")  // 参数校验
    },
    async ({ recentDays }) => {    // 工具实现
        let res = await taskFn(recentDays);
        return {
            content: [{
                type: 'text',
                text: '查询完成, 请查看文件'
            }]
        }
    }
)

// 启动服务器
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Talos PV MCP Server running on stdio");
}```



server 核心代码

```JavaScript
// 查询组件
const popupNames = [];

function getMidnightTimestampOfNDaysAgo(n) {
    const date = new Date();
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - n);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate.getTime();
}

async function fetchPopupData({
    popupName, recentDays = 1
}) {
    // const now = new Date();
    // now.setDate(now.getDate() - 1);
    // now.setHours(0, 0, 0, 0);
    const endTime = Math.floor(getMidnightTimestampOfNDaysAgo(1) / 1000);
    let startTime = 0;
    if (recentDays > 0) {
        // now.setDate(now.getDate() - recentDays);
        startTime = Math.floor(getMidnightTimestampOfNDaysAgo(recentDays) / 1000);
    }
    const params = {
        productId: '4',
        moduleId: '85',
        type: 'count',
        groupname: 'talosEggPopup',
        timeLevel: 'day',
        filter: JSON.stringify({
            popupName
        }),
        startTime: startTime.toString(),
        endTime: endTime.toString()
    };
    const paramsStr = new URLSearchParams(params).toString();
    const url = `https://spy.baidu.com/api/count/trend?${paramsStr}`;
    let res;
    try {
        res = await fetch(url, {
            method: 'GET',
            headers: {
                'Cookie': cookies,
            }
        }).then(res => res.json()).then(data => {
            // return data.data.series[0].yData[0];
            return {
                popupName,
                success: true,
                allData: data.data.series[0],
                pv: data.data.series[0].yData[0] || 0,
            };
        })
    }
    catch (err) {
        return {
            popupName,
            success: false,
            error: err.message,
        };
    }
    return res;
}

// 分批处理请求，避免同时发起太多请求
async function batchFetchRequests({ names, batchSize = 5, recentDays = 1 }) {
    for (let i = 0; i < names.length; i += batchSize) {
        const batch = names.slice(i, i + batchSize);
        const batchPromises = batch.map(name => fetchPopupData({
            popupName: name,
            recentDays
        }));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // 可选：在控制台显示进度
        console.log(`已完成 ${Math.min(i + batchSize, names.length)}/${names.length}`);

        // 可选：添加延迟以避免服务器压力
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}```

[图片]


暂时无法在飞书文档外展示此内容

一、工具方法生成
总结：Zulu在工具方法/工具类的生成中，已经可以生成较为完善的大体逻辑或框架，仅需要做细节修改即可
场景
输入
输出
在PDF阅读器中，每个页面单独发送翻译请求。若页面过多并翻页过快，需要控制同时请求的数量。
使用工具：Zulu
P1:
帮我写一个Promise并发控制器，要求可以自定义同时并发的Promise数量与传入promise方法。一批promise允许过程中，当有一个promise结束时，立即调用下一个promise
P2:
帮我改造promiseController，改造成class，要求可以逐次添加promise

/**
- Promise并发控制器类
*/
export class PromiseController<T> {
    private maxConcurrent: number;
    private results: T[] = [];
    private executing = new Set<Promise<T>>();
    private pendingFactories: Array<() => Promise<T>> = [];

    constructor(maxConcurrent: number) {
        this.maxConcurrent = maxConcurrent;
    }

    /**
     * 添加Promise工厂函数
     * @param factory Promise工厂函数
     */
    async add(factory: () => Promise<T>): Promise<void> {
        this.pendingFactories.push(factory);
        await this.processQueue();
    }

    /**
     * 等待所有Promise完成
     * @returns 所有Promise的结果
     */
    async waitAll(): Promise<T[]> {
        while (this.executing.size > 0 || this.pendingFactories.length > 0) {
            await Promise.race(this.executing);
            await this.processQueue();
        }
        return this.results;
    }

    private async processQueue(): Promise<void> {
        while (this.executing.size < this.maxConcurrent && this.pendingFactories.length > 0) {
            const factory = this.pendingFactories.shift()!;
            const promise = factory()
                .then(result => {
                    this.results.push(result);
                    this.executing.delete(promise);
                    return result;
                })
                .catch(error => {
                    this.executing.delete(promise);
                    throw error;
                });

            this.executing.add(promise);
        }
    }
}

在PDF阅读器中，需要对PDF进行截屏，要对多页面、多列（适配翻译时的双列展示）进行图片生成。需要手动拼接PDF的canvas元素，还原屏幕中的显示
使用工具：Zulu
P1:
帮我实现一个方法，要求能够拼接多个canvas，合成一个图像，并可以指定每个canvas中的间距与图片背景色
P2：
帮我修改mergeCanvases方法，要求可以裁剪生成的图片
P3：
帮我修改mergeCanvases方法，要求可以传入多列或一列canvas，传递多列时，左右排布
生成后，仅对其宽高取值修改为了clientHeight与clientWidth，即可投入使用（原来生成的方法使用的是canvas.width与canvas.height，在某些情况下无法获取其真实宽高）

二、业务组件修改
对于业务组件的整体操作，Zulu能够非常完整的将组件逻辑抽离出来

场景
输入
出
其他
渲染PDF时，单页渲染的逻辑需要抽离出来，进行复用。但原有逻辑比较繁重，因此使用Zulu进行尝试抽离
帮我将renderAllPages抽离成为一个单独的组件
[图片]
[图片]

最终生成的文件完整继承了原有功能，并没有做其他额外修改。

三、复杂逻辑阅读
总结：使用Zulu的过程中，对于复杂逻辑的代码阅读，区别于生成工具方法的简单提示词，即使给出了较为完整的提示词，其仍然难以理解，修改比较局限，仍需要多次提示或手动补全。
如在文件页：baidu/ps-se-fe-tpl/chat-search  *master/packages/chat-reader/src/utils/text.ts 中，想要优化成段方式时，通过补全提示词、段落内注释等多种方式进行生产，但最终生成代码无法投入使用。
[图片]




mcp 单测工具

作用
在生成单测或回答相关问题为大模型提供当前库上下文信息，包括用例编写规范，mock库使用说明等
实现
mcp插件可以分为三块：
- 注册（插件具体信息功能介绍）
- 客户端（插件与大模型通信）
- 服务端（插件具体功能实现）
注册
插件需要定义名称、标题、插件描述、参数描述，相当于为大模型提供一个插件使用说明书

server.registerTool('jest_helper', // 工具名
    {
        title: 'Jest单测辅助助手', // 工具标题
        description: getDesc(), // 工具描述
        inputSchema: { // 输入参数的schema
            question: z.string().describe('关于Jest单元测试的具体问题，如：编写测试用例、如何测试异步函数、如何mock模块等'),
        }
    },
    /** ... */
);

名称和标题
- 名称可以使用小写字母和下划线，如get_location、compute_utils
- 标题通常2-5个词描述核心功能即可
插件描述
- 详细但不冗长：1-3 句话说明功能
- 说明用途和价值：解释为什么需要这个插件，描述插件能做什么
- 提及关键特性：重要的功能点和限制

注意！本插件专门用于Jest单元测试开发的辅助工具。适用场景：
- 用户需要编写Jest测试用例
- 询问Jest API使用方法
- 需要mock函数或模块的示例
- 测试异步代码（Promise、async/await）
- 配置Jest测试环境
- 测试React组件或Node.js函数
- 解决Jest测试中的常见问题
关键词触发：jest、test、测试、测试用例、单元测试、mock、编写用例等
若符合条件，请调用此插件！
测试用例编写辅助工具 - 提供Jest单元测试的编写帮助，包括提供当前库上下文信息、用例示例、编写测试用例规范。适用于用户编写测试用例、测试异步函数、mock模块等场景。

参数描述
- 说明参数用途与数据类型
- 可以标明是否必需：required 或 optional
- 可以提供示例值
- 说明约束条件：长度限制、格式要求等
- 一般使用zod + TS 进行校验限制
inputSchema: {
    city: z.string()
        .min(1, "城市名不能为空")
        .max(100, "城市名过长")
        .describe('目标城市名称，支持中英文，如："北京"、"New York"、"Tokyo"'),
    
    days: z.number()
        .int("天数必须是整数")
        .min(1, "至少查询1天")
        .max(7, "最多查询7天")
        .default(3)
        .describe('预报天数，1-7天，默认3天'),
    
    units: z.enum(['celsius', 'fahrenheit'])
        .default('celsius')
        .describe('温度单位：celsius(摄氏度) 或 fahrenheit(华氏度)'),
    
    includeHourly: z.boolean()
        .default(false)
        .describe('是否包含每小时详细预报，默认false')
        .optianl()
}
重要性排序
插件描述 > 插件名称 > 参数描述 > 其他
大模型主要通过以下方式理解插件：
- 功能描述：判断插件是否能解决当前问题
- 语义匹配：将用户需求与插件描述进行语义相似度匹配
- 上下文理解：结合对话上下文判断插件的适用性
客户端
mcp客户端主要功能：
- JSON-RPC 通信协议处理
- 服务器进程管理
- 错误处理和重连机制
- 标准化的工具调用接口
- 资源访问管理
一般来说客户端的通信和管理工作由 VS Code、comate 等工具承担，无需我们开发，只需要将工具与插件链接，进行对应的配置与开启
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// 创建 mcpServer
const server = new McpServer({
    name: 'ut-mcp',
    version: '1.0.0',
});
// 插件与工具进行链接
const transport = new StdioServerTransport();
await server.connect(transport);
[图片]

"mcpServers": {
    "ui-mcp": {
        // 终端命令
        "command": "node",
        // 参数
        "args": [
            "/ut-mcp/dist/index.js"
        ],
        "disabled": false
    },
    // 也可以是 npm 包的形式安装插件
    "mcp-server-code-runner": {
        "command": "npx",
        "args": [
            "-y",
            "mcp-server-code-runner@latest"
        ]
    }
}
服务端
大模型会对需要使用到的插件进行链式调用，将上一次插件处理的结果选择性传递给下一个插件
这里我们接受到的入参 question，也并不是用户在输入框输入的原问题，而是经过上一个插件润色后问题文案
同时，我们将上下文与问题一同返回后，大模型会拿到结果进行再次处理

async ({ question }) => {
    // 获取上下文信息
    const context = getPrompt();
    return {
        content: [{ 
            type: 'text', 
            // 将上下文与问题一同输出给大模型
            text: `${context}\n\n问题：${question}`,
        }]
    };
}
# 背景
你是一个专业的测试工程师，接下来为你提供当前库的上下文信息，帮助用户编写高质量的测试用例或解决相关测试问题。

# 测试用例编写规范
- 编写测试用例前你需要了解被测试函数的功能与实现，所需要的参数及返回值，并分析所需要的测试场景。
- 测试用例需要标注被测试函数，模块与用例也需要使用中文描述，用例使用 it 编写。
- 用例适当使用注释，描述测试意图。
- 注意全局变量污染，用完后恢复原有状态，清除 mock、spy 等。
- 单个函数测试用例个数将可能减少，尽可能保持在 3 - 4 个左右，同时保证测试用例的代码、函数覆盖度要高，尽可能覆盖所有分支，边界值等。
- 当某些函数的代码分支由于自身实现而无法模拟、测试无法覆盖时，不要强行继续编写用例，而是在用例中直接注释说明。
- 你可以参考当前文件或 tests/specs 下的其他测试用例进行编写。

# 上下文
## 库基本描述
- 项目是采用 jest 测试框架进行测试，版本为 30.0.2 。
- jest 基本配置为 jsdom 环境，测试用例放在 tests/specs 下，用于测试前端 TS 代码。
- mock 包放在 tests/\_\_mocks\_\_ 下。
- 配置详情可查看 jest.config.js 文件。
- 测试运行命令为 npm run test。

## boxx 相关测试用例编写
- 在编写测试用例时，你可能会遇到模拟各种端能力的场景，关键词为 boxx，例如 boxx.canIuse、boxx.account.login 等。
- 你可以通过使用 mock 文件来模拟 boxx 的行为，在 tests/\_\_mocks\_\_/@baidu/boxx.ts 中模拟了 boxx 方法及行为，你可以进行查看。
- mock 包抛出的对象为你提供了 \_\_MOCK_CONFIG\_\_ 模拟配置，你可以通过它来模拟端能力的各种场景。例如：
```js
// Mock 登录端能力无法被调用的场景
const canIUseMockSpy = jest.spyOn(boxx.__MOCK_CONFIG__, 'canIUseMock').mockReturnValue(() => false);
expect(boxx.account.login).not.toHaveBeenCalled();
canIUseMockSpy.mockRestore();
// Mock 分享端能力被成功调用的场景
const canIUseMockSpy = jest.spyOn(boxx.__MOCK_CONFIG__, 'canIUseMock').mockReturnValue(() => true);
const isSuccessMockSpy = jest.spyOn(boxx.__MOCK_CONFIG__, 'isSuccessMock').mockImplementation(() => true);
const mockParams = {}; // 此处省略具体参数配置
const result = await share(mockParams);
expect(result).toEqual(boxx.__MOCK_CONFIG__.successRes);
canIUseMockSpy.mockRestore();
isSuccessMockSpy.mockRestore();
```
- \_\_MOCK_CONFIG\_\_ 有丰富配置，如成功、失败、结果、过程函数及参数都可以模拟，请依据情况善加利用。

暂时无法在飞书文档外展示此内容