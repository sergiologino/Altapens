# syntax=docker/dockerfile:1.4
# Сборка через Gradle Wrapper + кэш зависимостей (BuildKit): ускоряет повторные деплои и снижает риск таймаута на первом шаге.
FROM gradle:8.11.1-jdk17-alpine AS build
WORKDIR /home/gradle/project

ENV GRADLE_OPTS="-Xmx1536m -XX:MaxMetaspaceSize=384m -Dfile.encoding=UTF-8"
ENV LANG=C.UTF-8
ENV GRADLE_USER_HOME=/home/gradle/.gradle

COPY build.gradle settings.gradle gradle.properties ./
COPY gradle ./gradle
COPY gradlew ./
RUN chmod +x gradlew

# Слой без исходников: при изменении только Java-кода не перекачиваются Maven-зависимости
RUN --mount=type=cache,target=/home/gradle/.gradle \
    ./gradlew dependencies --no-daemon --no-watch-fs

COPY src ./src

RUN --mount=type=cache,target=/home/gradle/.gradle \
    ./gradlew bootJar -x test --no-daemon --no-watch-fs

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /home/gradle/project/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
