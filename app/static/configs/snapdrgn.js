{
  "main": {
    "debug": true,
    "showKeys": true,
    "retrievers": {
      "TreebankRetriever": {
        "resource": "demoXml",
        "docIdentifier": "treebank",
        "preselector": "w"
      }
    },
    "outputters": {
      "TreebankPersister": {
        "docIdentifier": "treebank"
      }
    },
    "plugins": [
      "text",
      "artificialToken",
      "opendataNetwork",
      "history"
    ],
    "layouts": [
      {
        "name": "Sidepanel",
        "template": "templates/main_with_sidepanel.html"
      },
      {
        "name": "Grid",
        "template": "templates/main_grid.html",
        "grid": [
          {
            "plugin": "text",
            "size": [
              35,
              3
            ],
            "position": [
              0,
              0
            ]
          },
          {
            "plugin": "opendataNetwork",
            "size": [
              23,
              25
            ],
            "position": [
              4,
              0
            ],
            "style": {
              "overflow": "hidden"
            }
          },
          {
            "plugin": "artificialToken",
            "size": [
              13,
              13
            ],
            "position": [
              16,
              36
            ]
          }
        ]
      }
    ]
  },
  "navbar": {
    "template": "templates/navbar1.html",
    "search": true,
    "navigation": true
  },
  "notifier": {
    "duration": "5000",
    "maxMessages": 7
  },
  "resources": {
    "fakeResolver": {
      "route": "http://localhost:8081/resolve/:urn",
      "params": [
        "urn"
      ]
    },
    "fakePerseids": {
      "route": "http://localhost:8081/xml_server/:doc",
      "params": [
        "doc",
        "s"
      ]
    },
    "localPerseids": {
      "route": "http://localhost:8081/xml_server/:doc",
      "params": [
        "doc",
        "s"
      ]
    },
    "fakeGold": {
      "route": "http://localhost:8081/xml_server/gold:gold",
      "params": [
        "gold",
        "s"
      ]
    },
    "fakePerseidsComments": {
      "route": "http://localhost:8081/comments/:doc",
      "params": [
        "doc"
      ]
    },
    "arethusaServerComments": {
      "route": "/examples/comments/:doc",
      "params": [
        "doc"
      ]
    },
    "arethusaServerTreebank": {
      "route": "/examples/treebanks/:doc",
      "params": [
        "doc"
      ]
    },
    "arethusaServerTreebankGold": {
      "route": "/examples/treebanks/:gold",
      "params": [
        "gold"
      ]
    },
    "phaidraTreebanks": {
      "route": "http://localhost:8081/examples/treebanks/phaidra/:doc",
      "params": [
        "doc"
      ]
    },
    "phaidraTranslations": {
      "route": "http://localhost:8081/examples/translations/phaidra/:doc",
      "params": [
        "doc"
      ]
    },
    "lexInvFusekiEndpoint": {
      "route": "http://sosol.perseus.tufts.edu/fuseki/ds/query?format=json"
    },
    "morphologyServiceLat": {
      "route": "http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=lat&engine=morpheuslat"
    },
    "morphologyServiceGrc": {
      "route": "http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=grc&engine=morpheusgrc"
    },
    "citeMapper": {
      "route": "http://localhost:8081/find_cite"
    },
    "sgGrammar": {
      "route": "http://localhost:8081/smyth/:doc.html"
    },
    "demoXml": {
      "route": "../dist/examples/:doc.xml",
      "params": [
        "doc"
      ]
    },
    "demoReviewXml": {
      "route": "../dist/examples/:gold.xml",
      "params": [
        "gold"
      ]
    }
  },
  "plugins": {
    "text": {
      "main": true,
      "template": "templates/text2.html"
    },
    "opendataNetwork": {
      "main": true,
      "contextMenu": true,
      "template": "templates/arethusa.opendata_network/opendata_network.html"
    }

    "search" : {
      "template" : "templates/search.html"
    },

    "morph" : {
      "retrievers" : {
        "BspMorphRetriever" : {
          "resource" : "morphologyServiceGrc"
        }
      },
      "template"  : "templates/morph3.html",
      "contextMenu" : true,
      "contextMenuTemplate": "templates/arethusa.morph/context_menu.html",
      "lexicalInventory" : {
        "retriever" : {
          "LexicalInventoryRetriever" : {
            "resource" : "lexInvFusekiEndpoint"
          }
        }
      },
      "@include" : "morph/gr_attributes2.json"
    },

    "relation" : {
      "template" : "templates/relation.html",
      "advancedMode" : true,
      "contextMenu" : true,
      "contextMenuTemplate": "templates/arethusa.relation/context_menu.html",
      "@include" : "relation/relations.json"
    },

    "review" : {
      "template" : "templates/arethusa.review/review.html",
      "retrievers" : {
        "TreebankRetriever" : {
          "resource" : "arethusaServerTreebank"
        }
      }
    },

    "history" : {
      "maxSize" : 5,
      "template" : "templates/history.html"
    },

    "artificialToken" : {
      "template" : "templates/arethusa.artificial_token/artificial_token.html"
    },

    "comments" : {
      "retriever" : {
        "CommentsRetriever" : {
          "resource" : "fakePerseidsComments"
        }
      }
    },

    "sg" : {
      "retriever" : {
        "SgGrammarRetriever" : {
          "resource" : "sgGrammar"
        }
      },
      "template" : "templates/sg.html",
      "contextMenu" : true,
      "contextMenuTemplate": "templates/arethusa.sg/context_menu.html",
      "@include" : "sg2/sg_labels.json"
    }
  },

  "exitHandler" : {
    "title" : "somewhere",
    "route" : "http://www.:x.com",
    "params" : ["x", "q"]
  },

  "keyCapture" : {
    "@include" : "keyboard/key_map.json"
  }
}


