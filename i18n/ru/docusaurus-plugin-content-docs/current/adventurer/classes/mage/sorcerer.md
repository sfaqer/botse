---
id: sorcerer
title: 'Чародей'
hoverText: ""
---

## Новичок

**Повышение**: Одновременно должно быть активно [<img src="/icons/party-size.svg" alt="Party Size Icon" className="icon-svg" />](/docs/glossary/party-size)+2 [зачарования (<img src="/icons/enchantment.svg" alt="Enchantment Icon" className="icon-svg" />)](/docs/adventurer/items/types/enchantment).

<!-- translate:off -->
:::info
<!-- translate:on -->
**Должен ли Чародей сам активировать все зачарования для повышения класса?**

Нет, зачарования может активировать любой персонаж.

<a href="https://discord.com/channels/273472391403798528/734891265690304634/1336010057359298653" target="_blank">Источник</a>
<!-- translate:off -->
:::
<!-- translate:on -->
**Врождённая способность**: Если вы начинаете свой ход в режиме [<img src="/icons/magic.svg" alt="Magic Icon" className="icon-svg" />](/docs/battles/battle-forms/magic), получите 1 [стойкости](/docs/glossary/tenacity).

<div className="class-table-wrapper">

| Стоимость стойкости | Название         | Способность                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1                   | Power Surge      | Потратьте любое количество дополнительной [стойкости](/docs/glossary/tenacity). Выберите персонажа: он возвращает с левого края своего [трека перезарядки](/docs/glossary/cooldown-track) столько кубиков, сколько дополнительной стойкости вы потратили.                                                                                                                                                                         |
| 2                   | Lightning Splash | **[Прерывающая способность](/docs/glossary/interrupt):** После того как вы повергли врага, нанесите по 2 единицы урона каждой [боевой единице](/docs/glossary/unit), которая находилась в пределах [дальности](/docs/glossary/range) этого врага.                                                                                                                                                                                 |
| 2                   | Unholy Knowledge | [<img src="/icons/magic.svg" alt="Magic Icon" className="icon-svg" />](/docs/battles/battle-forms/magic): Бросьте любой 1 кубик состояния с [трека перезарядки](/docs/glossary/cooldown-track) любого персонажа и верните его на то же место с новым результатом.                                                                                                                                                                 |
| 3                   | Dark Exchange    | [<img src="/icons/magic.svg" alt="Magic Icon" className="icon-svg" />](/docs/battles/battle-forms/magic): Уберите по 1 фишке ОЗ из-под своей фишки и фишки любой [боевой единицы](/docs/glossary/unit) в пределах [дальности](/docs/glossary/range). Добавьте обе фишки ОЗ любой другой боевой единице в пределах дальности (запас здоровья может превысить значение характеристики [«Здоровье»](/docs/adventurer/stats/health)). |
| 4                   | Blood Magic      | [<img src="/icons/magic.svg" alt="Magic Icon" className="icon-svg" />](/docs/battles/battle-forms/magic): Каждый персонаж в игре полностью восстанавливает свой запас ОЗ, [затем](/docs/glossary/then) получает столько серебристых кубиков [усталости](/docs/glossary/fatigue), сколько ОЗ он восстановил. Серебристые кубики усталости, которые нельзя разместить, не вызывают переутомления.                                   |

</div>

## Мастер

**Врождённая способность**: Если вы начинаете свой ход в режиме [<img src="/icons/magic.svg" alt="Magic Icon" className="icon-svg" />](/docs/battles/battle-forms/magic), получите 1 [стойкости](/docs/glossary/tenacity) или уберите 1 серебристый кубик [усталости](/docs/glossary/fatigue) со своего [трека перезарядки](/docs/glossary/cooldown-track).

<div className="class-table-wrapper">

| Стоимость стойкости | Название         | Способность                                                                                                                                                                                                                                                                                                                                                                             | Эффект повышения                                                                     |
| ------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1                   | Power Surge      | Потратьте любое количество дополнительной [стойкости](/docs/glossary/tenacity). Выберите персонажа: он возвращает с левого края своего [трека перезарядки](/docs/glossary/cooldown-track) столько кубиков, сколько дополнительной стойкости вы потратили, плюс 1.                                                                                                                       | + 1 возвращаемый кубик                                                               |
| 2                   | Lightning Splash | **[Прерывающая способность](/docs/glossary/interrupt):** После того как вы повергли врага, нанесите по 2 единицы урона каждому врагу, который находился в пределах [дальности](/docs/glossary/range) поверженного врага.                                                                                                                                                                | Действует только на врагов, а не на все боевые единицы                               |
| 3                   | Unholy Knowledge | [<img src="/icons/magic.svg" alt="Magic Icon" className="icon-svg" />](/docs/battles/battle-forms/magic): Поверните любой 1 кубик состояния на [треке перезарядки](/docs/glossary/cooldown-track) любого персонажа выбранной вами гранью вверх.                                                                                                                                         | Стоимость стойкости (2 → 3); грань выбирается вместо броска                          |
| 3                   | Dark Exchange    | [<img src="/icons/magic.svg" alt="Magic Icon" className="icon-svg" />](/docs/battles/battle-forms/magic): Переложите до 2 фишек ОЗ от любой [боевой единицы](/docs/glossary/unit) в пределах [дальности](/docs/glossary/range) к любой другой боевой единице в пределах дальности (запас здоровья может превысить значение характеристики [«Здоровье»](/docs/adventurer/stats/health)). | 2 ОЗ вместо 1; можно применять к любым боевым единицам                               |
| 5                   | Blood Magic      | [<img src="/icons/magic.svg" alt="Magic Icon" className="icon-svg" />](/docs/battles/battle-forms/magic): Каждый персонаж в игре полностью восстанавливает свой запас ОЗ, [затем](/docs/glossary/then) убирает столько серебристых кубиков [усталости](/docs/glossary/fatigue), сколько ОЗ он восстановил.                                                                              | Стоимость стойкости (4 → 5); серебристые кубики усталости убираются вместо получения |

</div>

---

<!-- translate:off -->
:::info
<!-- translate:on -->
**Можно ли с помощью Dark Exchange убрать последнее ОЗ у врага и повергнуть его?**

Да.

---

**Можно ли восстановить себе ОЗ с помощью Dark Exchange на стороне новичка?**

«[<img src="/icons/magic.svg" alt="Magic Icon" className="icon-svg" />](/docs/battles/battle-forms/magic): Уберите по 1 фишке ОЗ из-под своей фишки и фишки любой [боевой единицы](/docs/glossary/unit) в пределах [дальности](/docs/glossary/range). Добавьте обе фишки ОЗ **любой другой боевой единице** в пределах дальности (запас здоровья может превысить значение характеристики [«Здоровье»](/docs/adventurer/stats/health))».

Нет, этой способностью нельзя восстановить здоровье себе. Вы должны убрать ОЗ у себя и другой боевой единицы, а затем добавить эти фишки **любой другой боевой единице**, поэтому вернуть их себе нельзя. Однако Dark Exchange на стороне мастера позволяет восстанавливать здоровье себе.

<a href="https://discord.com/channels/273472391403798528/734891265690304634/1343996569476792372" target="_blank">Источник</a>

---

**Можно ли предотвратить урон от Lightning Splash кубиками навыков «Бой» или «Тяжёлая броня»?**

Нет, урон от Lightning Splash наносит [персонаж](/docs/glossary/adventurer) класса «Чародей». Большинство эффектов предотвращения урона, в том числе кубики навыков «Бой» и «Тяжёлая броня», указывают: «Когда вам наносит урон **[враг](/docs/glossary/enemy)**…». Поэтому эти кубики не позволяют предотвратить урон от Lightning Splash, поскольку его наносит персонаж.

<a href="https://discord.com/channels/273472391403798528/1406510845814636585/1406561001112866856" target="_blank">Источник</a>
<!-- translate:off -->
:::
<!-- translate:on -->
## Связанные материалы

<div className="responsive-embed">
	<iframe src="https://www.youtube.com/embed/6q0cdtwwRg8?si=ypNfHcpF07ySebuY" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
</div>
