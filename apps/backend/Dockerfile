# Сборка без wrapper: образ Gradle качает зависимости по build.gradle
FROM gradle:8.11.1-jdk17-alpine AS build
WORKDIR /home/gradle/project

COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY src ./src

RUN gradle bootJar -x test --no-daemon --no-watch-fs

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl

COPY --from=build /home/gradle/project/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
