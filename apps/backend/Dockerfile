# Сборка через Gradle Wrapper (та же версия, что в репозитории) + gradle.properties.
FROM gradle:8.11.1-jdk17-alpine AS build
WORKDIR /home/gradle/project

ENV GRADLE_OPTS="-Xmx1536m -XX:MaxMetaspaceSize=384m -Dfile.encoding=UTF-8"
ENV LANG=C.UTF-8

COPY build.gradle settings.gradle gradle.properties ./
COPY gradle ./gradle
COPY gradlew ./
RUN chmod +x gradlew

COPY src ./src

RUN ./gradlew bootJar -x test --no-daemon --no-watch-fs

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Без apk: установка curl часто зависает на зеркалах; healthcheck в compose использует встроенный wget.

COPY --from=build /home/gradle/project/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
