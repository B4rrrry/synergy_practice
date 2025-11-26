; База знаний консультантов Dashboard Expert
; Назначение: выдача инструкций по типовым кейсам сопровождения

(defglobal
   ?*explain* = TRUE)

; Факт с описанием обращения консультанта
(deftemplate support-case
   (slot topic (allowed-values access data-refresh release ticket-wait encoding))
   (slot channel (allowed-values request incident advisory) (default request))
   (slot severity (allowed-values low medium high) (default medium)))

; Фиксация рекомендаций
(deftemplate recommendation
   (slot category)
   (slot message)
   (slot rationale))

; Универсальный вывод рекомендации
(deffunction emit (?category ?message ?rationale)
   (assert (recommendation (category ?category)
                           (message ?message)
                           (rationale ?rationale)))
   (if ?*explain* then
      (printout t "[EXPLAIN] " ?category ": " ?rationale crlf)))

; Кейс 1: выдача доступа к дашборду
(defrule access-granting
   (support-case (topic access))
   =>
   (emit "Access management"
         "Запроси доменную группу доступа из спецификации и добавь пользователя в AD перед выдачей доступа к дашборду."
         "В спецификации по приложению зафиксированы допустимые группы Active Directory, нарушение цепочки доступа запрещено."))

; Кейс 2: зависание загрузки данных
(defrule data-refresh-errors
   (support-case (topic data-refresh))
   =>
   (emit "Data refresh"
         "Проверь, не открыт ли Excel-файл источника заказчиком, попроси закрыть его и перезапусти обновление данных."
         "Блокировка файла в процессе обновления вызывает ошибки выгрузки, повторный запуск после закрытия Excel восстанавливает процесс."))

; Кейс 3: подача релиза
(defrule release-process
   (support-case (topic release))
   =>
   (emit "Release management"
         "Сформируй спецификацию приложения, Release Notes, подай заявку на установку, а затем согласуй релиз с ИБ и архитекторами."
         "Релиз допускается после полного пакета артефактов и прохождения обязательных согласований, иначе установка будет отклонена."))

; Кейс 4: перевод обращения в ожидание
(defrule ticket-waiting
   (support-case (topic ticket-wait))
   =>
   (emit "Communication"
         "Перед отправкой обращения в статус ожидания согласуй это действие с инициатором и зафиксируй результат в комментариях."
         "Перевод без согласования нарушает SLA и вызывает недовольство заказчика, поэтому нужно подтвердить ожидание."))

; Кейс 5: некорректная кодировка скриптов
(defrule script-encoding
   (support-case (topic encoding))
   =>
   (emit "Development"
         "Измени кодировку проблемного скрипта на UTF-8 с BOM и перезапусти обработку."
         "Производственный контур ожидает UTF-8 + BOM, иная кодировка вызывает ошибки интерпретации."))

; Сценарный запуск: принимает произвольное количество кейсов
(deffunction run-scenario ($?topics)
   (reset)
   (if (= (length$ $?topics) 0) then
      (printout t "[WARN] Передайте хотя бы один код кейса из доступных: access/data-refresh/release/ticket-wait/encoding" crlf))
   (foreach ?topic $?topics
      (if (member$ ?topic (create$ access data-refresh release ticket-wait encoding)) then
         (assert (support-case (topic ?topic)))
      else
         (printout t "[WARN] Такого кейса не существует: " ?topic crlf)))
   (run)
   (facts))

; Примеры:
; CLIPS> (load "dashboard_expert.clp")
; CLIPS> (run-scenario access release)
