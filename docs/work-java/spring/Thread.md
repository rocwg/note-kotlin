
::: code-group

```Java [老]
public void updateReportWithPageThread(List<Card> cards) {
    //开分页
    List<List<Card>> partition = Lists.partition(cards, 100);
    //并发执行
    ThreadFactory threadFactory = new ThreadFactoryBuilder().setNameFormat("reportMonthSettle-pool-%d").build();
    ExecutorService executorService = Executors.newFixedThreadPool(6, threadFactory);
    CompletableFuture[] cfs = partition.stream().map(curPage -> CompletableFuture.runAsync(() -> {
        monthLog.info("-- 开始 reportMonthSettle 数据填充！任务号:{} 数量:{}", Thread.currentThread().getName(), curPage.size());
        baseMapper.saveOrUpdateByReplace(curPage.stream().map(this::updateReportByCard).collect(Collectors.toList()));
    }, executorService)).toArray(CompletableFuture[]::new);
    CompletableFuture.allOf(cfs).join();
    monthLog.info("-- 数据填充完成！线程池状态：{} ", executorService.isTerminated()); //为什么不答应这个和下面的？，这种线程不结束的吗？
    executorService.shutdown();
    monthLog.info("-- 数据填充线程关闭！线程池状态：{} ", executorService.isTerminated());
}
```

```Java [新]
public void updateReportWithPageThread(List<Card> cards) {
    List<CompletableFuture<List<ReportMonthSettle>>> list = Lists.partition(cards, cards.size() / 2).stream().map(curPage -> CompletableFuture.supplyAsync(() -> {
        monthLog.info("-- 开始 reportMonthSettle 数据填充！任务号:{} 数量:{}", Thread.currentThread().getName(), curPage.size());
        return curPage.stream().map(this::updateReportByCard).collect(Collectors.toList());
    }, threadPoolTaskExecutor)).collect(Collectors.toList()); //PS: 我的理解：进入数据分成了两份，开两个异步同时执行。//去除自定义线程。

    List<List<ReportMonthSettle>> result = list.stream().map(CompletableFuture::join).collect(Collectors.toList());
    for (List<ReportMonthSettle> curPage : result) {
        this.baseMapper.saveOrUpdateByReplace(curPage);
    }
}
```
:::


::: code-group


```Java [测试1：CompletableFuture 和 stream]
@Test
public void testXXX() {
    List<CompletableFuture<String>> list = Lists.newArrayList();
    ArrayList<Integer> allMans = Lists.newArrayList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
    List<List<Integer>> partition = Lists.partition(allMans, 500);
    for (int i = 0; i < 1000; i++) {
        int finalI = i;
        List<Integer> curPage = partition.get(i);
        CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> {
            log.info("--开始 第 {} 轮， 运动元数量 {}, ===== {}", finalI, curPage.size(), Thread.currentThread().getName());
            return this.yyy(finalI, curPage);
        }, threadPoolTaskExecutor);
        list.add(cf);
    }
    List<String> collect = list.stream().map(CompletableFuture::join).collect(Collectors.toList());
    System.out.println(collect);
}

private String yyy (int finalI, List<Integer> subList) {
    AtomicInteger firstOne = new AtomicInteger();
    AtomicReference<Long> minTime = new AtomicReference<>(Long.MAX_VALUE);
    subList.forEach(it -> {
        long l = (long) (Math.random() * 10);
        try {
            TimeUnit.SECONDS.sleep(l);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        log.info("======================第 {} 轮 - 运动员 {} 完成了比赛, 耗时 {}",finalI, it, l);
        if (l < minTime.get()) {
            minTime.set(l);
            firstOne.set(it);
        }
    });
    return String.format("==========第 %s 轮, 奖 %s, 耗时 %s", finalI, firstOne, minTime);
}
```

```Java [测试二：CountDownLatch]
@Test
public void TestCountLatch1() {
    System.out.println(Runtime.getRuntime().availableProcessors());
    List<Integer> allMans = Lists.newArrayList(1, 2, 3, 4, 5, 6);
    CountDownLatch latch = new CountDownLatch(allMans.size());
    ExecutorService executorService = Executors.newFixedThreadPool(allMans.size());
    for (int i = 1; i <= allMans.size(); i++) {
        Runnable runnable = getRunnable(i, latch);
        executorService.submit(runnable);
    }
    log.info("等待5个运动员都完成。。。");
    try {
        latch.await();
    } catch (InterruptedException e) {
        log.info("countDownLatch await error：{}", e.getMessage(), e);
    }
    log.info("任务号 {} ==> 所有人都完成", Thread.currentThread().getName());
}

private static Runnable getRunnable(int i, CountDownLatch latch) {
    return () -> {
        try {
            TimeUnit.SECONDS.sleep((long) (Math.random() * 10));
            log.info("任务号 {} ==> {} 号完成了比赛", Thread.currentThread().getName(), i);
        } catch (InterruptedException e) {
            log.info("-----------------------");
            throw new RuntimeException(e);
        } finally {
            latch.countDown();
        }
    };
}
```

:::
