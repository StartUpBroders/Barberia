FROM maven:3.9.11-eclipse-temurin-21-alpine AS build

WORKDIR /app

COPY pom.xml ./
RUN mvn --batch-mode dependency:go-offline

COPY src ./src
RUN mvn --batch-mode --define skipTests package

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup --system spring && adduser --system --ingroup spring spring

COPY --from=build --chown=spring:spring /app/target/gestion-citas-*.jar ./app.jar

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
