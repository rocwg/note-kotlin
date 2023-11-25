# MySQL 语句记录

## 时间

### 月份差 两个时间


::: code-group

```sql [PERIOD_DIFF]
SELECT PERIOD_DIFF(201703, 201710); # -7
SELECT PERIOD_DIFF(201710, 201703); # 7

-- 注意：这是以 mon 作为计算要素，基准为 跨月
-- 实际使用中，可以使用 `EXTRACT` 去转换时间

SELECT PERIOD_DIFF(EXTRACT(YEAR_MONTH FROM '2023-09-30'), EXTRACT(YEAR_MONTH FROM '2022-12-01'))  AS months;  -- 9
SELECT PERIOD_DIFF(EXTRACT(YEAR_MONTH FROM '2023-09-30'), EXTRACT(YEAR_MONTH FROM '2023-01-01'))  AS months;  -- 8
SELECT PERIOD_DIFF(EXTRACT(YEAR_MONTH FROM '2023-09-30'), EXTRACT(YEAR_MONTH FROM NOW()))  AS months;         -- 0
SELECT PERIOD_DIFF(EXTRACT(YEAR_MONTH FROM '2023-09-30'), EXTRACT(YEAR_MONTH FROM '2023-10-01')) AS months; -- -1
SELECT PERIOD_DIFF(EXTRACT(YEAR_MONTH FROM '2023-09-30'), EXTRACT(YEAR_MONTH FROM '2023-10-29')) AS months; -- -1
SELECT PERIOD_DIFF(EXTRACT(YEAR_MONTH FROM '2023-09-30'), EXTRACT(YEAR_MONTH FROM '2023-11-01')) AS months; -- -2
```

```sql [TIMESTAMPDIFF]
SELECT TIMESTAMPDIFF(MONTH, '2023-09-08', '2023-08-01'); -- -1
SELECT TIMESTAMPDIFF(MONTH, '2023-09-08', '2023-08-20'); --  0

-- 注意：这是以 day 作为计算要素，
```
:::


## 分页

::: code-group

```java
    /**
     * @param query       检索条件
     * @param currentPage 当前页数
     * @param pageSize    每页显示记录数
     */
    private void buildPageLimit(CardExtend query, Integer currentPage, Integer pageSize) {
        Integer offset = (currentPage - 1) * pageSize; //偏移量
        Integer startRow = offset + pageSize;          //起始
        query.setStartRow(startRow); 
        query.setOffset(offset);   
    }
```

```sql
    select t.msisdn, t.iccid
    from iotc_card t
    where t.card_status = 1
      limit ${card.startRow}, ${card.offset}
```

:::


## 插入

::: code-group

```java
   @Transactional(rollbackFor = Exception.class)
    public void insertBatchRoc(List<CardPackPlan> plans, int batchSize) {
        if (CollectionUtils.isEmpty(plans)) return;
        Lists.partition(plans, batchSize).forEach(subPart -> baseMapper.insertBatchRoc(subPart));
    }
```

```sql
insert into XX_plan (create_time, update_time, msisdn, client_pack_id, period_start_time, period_end_time,
                     period_sort, status, period_pack_usage, period_can_usage, remark)
values (now(), now(), ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (now(), now(), ?, ?, ?, ?, ?, ?, ?, ?, ?),
    18493412326(Long), 159(Long), 2023-11-01 00:00:00.0(Timestamp), 2023-11-30 00:00:00.0(Timestamp), 26(Integer), 1(Byte), 5.00(BigDecimal), 5.00(BigDecimal), ceshi Roc：正常(String),
    18493412326(Long), 159(Long), 2023-12-01 00:00:00.0(Timestamp), 2023-12-31 00:00:00.0(Timestamp), 27(Integer), 1(Byte), 5.00(BigDecimal), 5.00(BigDecimal), ceshi Roc：正常(String),
```
:::
