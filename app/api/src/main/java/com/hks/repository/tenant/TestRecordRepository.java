package com.hks.repository.tenant;

import com.hks.entity.TestRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRecordRepository extends JpaRepository<TestRecord, Long> {}
