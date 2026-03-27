package com.github.cooker.pan.config;

import org.mapdb.DB;
import org.mapdb.DBMaker;
import org.mapdb.Serializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapDbConfig {

    @Bean(destroyMethod = "close")
    public DB mapDb(@Value("${app.mapdb.in-memory:false}") boolean inMemory) {
        if (inMemory) {
            return DBMaker.memoryDB().transactionEnable().make();
        }
        return DBMaker.fileDB("search-cache.db")
            .fileMmapEnableIfSupported()
            .transactionEnable()
            .make();
    }

    @Bean
    public org.mapdb.HTreeMap<String, Long> hotKeywordCounter(DB db) {
        return db.hashMap("hotKeywordCounter", Serializer.STRING, Serializer.LONG)
            .counterEnable()
            .createOrOpen();
    }
}
