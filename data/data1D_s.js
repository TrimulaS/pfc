const jsonData = {

"eon":[
    { "id": "Фанерозой",                "Start": 541000,    "End": 0,            "Shift": 0,    "Type": "Eon",   "English": "Phanerozoic"       },
    { "id": "Протерозой",               "Start": 2500000,   "End": 541000,       "Shift": 0,    "Type": "Eon",   "English": "Proterozoic"       },
    { "id": "Архей",                    "Start": 4000000,   "End": 2500000,      "Shift": 0,    "Type": "Eon",   "English": "Archean"           },
    { "id": "Катархей (Гадей)",         "Start": 4600000,   "End": 4000000,      "Shift": 0,    "Type": "Eon",   "English": "Hadean"             } 
],
"era":[    
    { "id": "Кайнозой",                 "Start": 66000,     "End": 0,            "Shift": 1,    "Type": "Era",   "English": "Cenozoic"          },
    { "id": "Мезозой",                  "Start": 251902,    "End": 66000,        "Shift": 1,    "Type": "Era",   "English": "Mesozoic"          },
    { "id": "Палеозой",                 "Start": 538800,    "End": 251902,       "Shift": 1,    "Type": "Era",   "English": "Paleozoic"         },
    { "id": "Нео - протерозой",         "Start": 1000000,   "End": 538800,       "Shift": 1,    "Type": "Era",   "English": "Neoproterozoic"    }
],
"period":[
    { "id": "Четвертичный Антропоген",  "Start": 2580,      "End": 0,            "Shift": 2,   "Type": "Period", "English": "Quaternary"       },
    { "id": "Неоген",                   "Start": 23000,     "End": 2580,         "Shift": 2,   "Type": "Period", "English": "Neogene"         },
    { "id": "Палеоген",                 "Start": 66000,     "End": 23000,        "Shift": 2,   "Type": "Period", "English": "Paleogene"       },
    { "id": "Мел",                      "Start": 145000,    "End": 66000,        "Shift": 2,   "Type": "Period", "English": "Cretaceous"      }

],
"epoch":[
    { "id": "Голоцен",                  "Start": 11.7,      "End": 0,            "Shift": 3,   "Type": "Epoch",  "English": "Holocene"         },
    { "id": "Плейстоцен",               "Start": 2580,      "End": 11.7,         "Shift": 3,   "Type": "Epoch",  "English": "Pleistocene"      },
    { "id": "Плиоцен",                  "Start": 5333,      "End": 2580,         "Shift": 3,   "Type": "Epoch",  "English": "Pliocene"         },
    { "id": "Миоцен",                   "Start": 23030,     "End": 5333,         "Shift": 3,   "Type": "Epoch",  "English": "Miocene"          },
    { "id": "Олигоцен",                 "Start": 33900,     "End": 23030,        "Shift": 3,   "Type": "Epoch",  "English": "Oligocene"        }
],

"age":[
    { "id": "Мегхалайский",             "Start": 4.2,       "End": 0,            "Shift": 4,   "Type": "Age",    "English": "Meghalayan"       },
    { "id": "Северогриппианский",       "Start": 8.2,       "End": 4.2,          "Shift": 4,   "Type": "Age",    "English": "Northgrippian"    },
    { "id": "Гренландский",             "Start": 11.7,      "End": 8.2,          "Shift": 4,   "Type": "Age",    "English": "Greenlandian"     },
    { "id": "Тарантийский",             "Start": 126,       "End": 11.7,         "Shift": 4,   "Type": "Age",    "English": "Tarantian"        },
    { "id": "Средний Ionian",           "Start": 781,       "End": 126,          "Shift": 4,   "Type": "Age",    "English": "Ionian"           },
    { "id": "Калабрийский",             "Start": 1800,      "End": 781,          "Shift": 4,   "Type": "Age",    "English": "Calabrian"        },
    { "id": "Гелазский",                "Start": 2580,      "End": 1800,         "Shift": 4,   "Type": "Age",    "English": "Gelasian"         },
    { "id": "Пьяченцский",              "Start": 3600,      "End": 2580,         "Shift": 4,   "Type": "Age",    "English": "Piacenzian"       },
    { "id": "Занклский",                "Start": 5333,      "End": 3600,         "Shift": 4,   "Type": "Age",    "English": "Zanclean"         },
    { "id": "Мессинский",               "Start": 7246,      "End": 5333,         "Shift": 4,   "Type": "Age",    "English": "Messinian"        },
    { "id": "Тортонский",               "Start": 11630,     "End": 7246,         "Shift": 4,   "Type": "Age",    "English": "Tortonian"        },
    { "id": "Серравальский",            "Start": 13820,     "End": 11630,        "Shift": 4,   "Type": "Age",    "English": "Serravallian"     },
    { "id": "Лангский",                 "Start": 15970,     "End": 13820,        "Shift": 4,   "Type": "Age",    "English": "Langhian"         },
    { "id": "Бурдигальский",            "Start": 20440,     "End": 15970,        "Shift": 4,   "Type": "Age",    "English": "Burdigalian"      },
    { "id": "Аквитанский",              "Start": 23030,     "End": 20440,        "Shift": 4,   "Type": "Age",    "English": "Aquitanian"       },
    { "id": "Хаттский",                 "Start": 28100,     "End": 23030,        "Shift": 4,   "Type": "Age",    "English": "Chattian"         },
    { "id": "Рюпельский",               "Start": 33900,     "End": 28100,        "Shift": 4,   "Type": "Age",    "English": "Rupelian"         },
    { "id": "Приабонский",              "Start": 37800,     "End": 33900,        "Shift": 4,   "Type": "Age",    "English": "Priabonian"       },
    { "id": "Бартонский",               "Start": 41200,     "End": 37800,        "Shift": 4,   "Type": "Age",    "English": "Bartonian"        },
    { "id": "Лютетский",                "Start": 47800,     "End": 41200,        "Shift": 4,   "Type": "Age",    "English": "Lutetian"         },
    { "id": "Ипрский",                  "Start": 56000,     "End": 47800,        "Shift": 4,   "Type": "Age",    "English": "Ypresian"         },
    { "id": "Танетский",                "Start": 59200,     "End": 56000,        "Shift": 4,   "Type": "Age",    "English": "Thanetian"        },
    { "id": "Зеландский",               "Start": 61600,     "End": 59200,        "Shift": 4,   "Type": "Age",    "English": "Selandian"        },
    { "id": "Датский",                  "Start": 66000,     "End": 61600,        "Shift": 4,   "Type": "Age",    "English": "Danian"           }

   ] }  ;