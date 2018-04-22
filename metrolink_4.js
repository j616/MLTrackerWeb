$(function() {
    var apiBase = window.location.hostname + "/api/";
    if (window.location.protocol !== "https:") {
        apiBase = "http://" + apiBase;
    } else {
        apiBase = "https://" + apiBase;
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    var milliToMins = function(millis) {
        secs = millis / 60000;
        return Math.round(secs * 2) / 2;
    };

    var getTramDueStr = function(millis, lastUpdate) {
        var tramDue = "";
        if (millis === -1) {
            tramDue = "At Station";
        } else {
            mins = milliToMins(Math.max(0, millis - lastUpdate));
            if (mins === 1) {
                tramDue = "1 min";
            } else if (mins === 0) {
                tramDue = "<0.5 mins";
            } else {
                tramDue = mins + " mins";
            }
        }

        return tramDue;
    };

    var makeDestModal = function(dest, predictions, lastUpdate) {
        var predTbl = [];
        var curStop = getCookie("station");

        var warningExp = null;

        for (x in predictions) {
            var pred = predictions[x];
            var tramDue = getTramDueStr(
                pred["predictedArriveTime"],
                lastUpdate
            );
            if (pred["warnings"].includes("notStarted")) {
                tramDue = tramDue + " ⓘ";
                warningExp = $("<div/>").text(
                    "ⓘ Tram hasn't left its first stop. Predictions may be \
                    less accurate than normal"
                );
            }
            predTbl.push(
                $("<tr/>").append([
                    $("<td/>").text(tramDue),
                    $("<td/>").text(pred["carriages"])
                ])
            );
        }

        var predEl = $("<table/>", {
            class: "table table-striped table-light"
        }).append([
            $("<thead/>").append([
                $("<tr/>").append([
                    $("<th/>", {
                        scope: "col"
                    }).text("Due"),
                    $("<th/>", {
                        scope: "col"
                    }).text("Carriages")
                ])
            ]),
            $("<tbody/>").append(predTbl)
        ]);

        $("body").prepend([
            $("<div/>", {
                class: "modal fade text-dark tramDestModal",
                id: dest + "Modal",
                tabindex: "-1",
                role: "dialog",
                "aria-labelledby": "tramDestModel",
                "aria-hidden": "true"
            }).append([
                $("<div/>", {
                    class: "modal-dialog",
                    role: "document"
                }).append([
                    $("<div/>", {
                        class: "modal-content"
                    }).append([
                        $("<div/>", {
                            class: "modal-header"
                        }).append([
                            $("<h5/>", {
                                class: "modal-title"
                            }).text("Trams to " + dest + " from " + curStop),
                            $("<button/>", {
                                type: "button",
                                class: "close",
                                "data-dismiss": "modal",
                                "aria-label": "Close"
                            }).append([
                                $("<span/>", {
                                    "aria-hidden": "true"
                                }).text("×")
                            ])
                        ]),
                        $("<div/>", {
                            class: "modal-body"
                        }).append([predEl, warningExp])
                    ])
                ])
            ])
        ]);
    };

    var makeTramTimeModal = function(
        dest,
        millis,
        due,
        warnings,
        times,
        lastUpdate
    ) {
        warningEl = null;
        predTbl = [];
        predEl = null;
        curStop = getCookie("station");

        if (warnings.length > 0) {
            var warningsTbl = [];
            if (warnings.includes("notStarted")) {
                warningsTbl.push(
                    $("<tr/>").append(
                        $("<td/>").text(
                            "This tram hasn't left its starting station yet. \
                            Predictions may be less accurate."
                        )
                    )
                );
            }

            if (warnings.includes("noDestPred")) {
                warningsTbl.push(
                    $("<tr/>").append(
                        $("<td/>").text(
                            "We don't currently have predicted arrival times \
                            for all stops on this tram's route."
                        )
                    )
                );
            }

            warningEl = $("<table/>", {
                class: "table table-striped table-light"
            }).append([
                $("<thead/>").append([
                    $("<tr/>").append([
                        $("<th/>", {
                            scope: "col"
                        }).text("Warnings")
                    ])
                ]),
                $("<tbody/>").append(warningsTbl)
            ]);
        }

        for (x in times) {
            var pred = times[x];
            var station = $("<td/>").append([
                $("<a/>", {
                    href: "#" + pred["station"],
                    class: "tramTimeModalA"
                }).text(pred["station"])
            ]);
            var arrival = $("<td/>").text(
                getTramDueStr(pred["predictedArriveTime"], lastUpdate)
            );
            if (pred["station"] == curStop) {
                station.addClass("font-weight-bold");
                arrival.addClass("font-weight-bold");
            }
            predTbl.push($("<tr/>").append([station, arrival]));
        }

        predEl = $("<table/>", {
            class: "table table-striped table-light"
        }).append([
            $("<thead/>").append([
                $("<tr/>").append([
                    $("<th/>", {
                        scope: "col"
                    }).text("Station"),
                    $("<th/>", {
                        scope: "col"
                    }).text("Due")
                ])
            ]),
            $("<tbody/>").append(predTbl)
        ]);

        var modalID = dest + millis + "Modal";
        $("body").prepend([
            $("<div/>", {
                class: "modal fade text-dark tramTimeModal",
                id: modalID,
                tabindex: "-1",
                role: "dialog",
                "aria-labelledby": modalID,
                "aria-hidden": true
            }).append([
                $("<div/>", {
                    class: "modal-dialog",
                    role: "document"
                }).append([
                    $("<div/>", {
                        class: "modal-content"
                    }).append([
                        $("<div/>", {
                            class: "modal-header"
                        }).append([
                            $("<h5/>", {
                                class: "modal-title"
                            }).text("Tram to " + dest),
                            $("<button/>", {
                                type: "button",
                                class: "close",
                                "data-dismiss": "modal",
                                "aria-label": "Close"
                            }).append([
                                $("<span/>", {
                                    "aria-hidden": "true"
                                }).text("×")
                            ])
                        ]),
                        $("<div/>", {
                            class: "modal-body"
                        }).append([warningEl, predEl])
                    ])
                ])
            ])
        ]);

        $(".tramTimeModalA").on("click", function() {
            setCookie("station", $(this).text(), 365);
            updateTrams($(this).text());
            $("#" + modalID).modal("hide");
            $("body").removeClass("modal-open");
            $(".modal-backdrop").remove();
        });
    };

    var displayTrams = function(predictions, lastUpdate) {
        var getTramDue = function(dest, millis, warnings, times) {
            var tramDue = getTramDueStr(millis, lastUpdate);

            makeTramTimeModal(
                dest,
                millis,
                tramDue,
                warnings,
                times,
                lastUpdate
            );

            if (warnings.includes("notStarted")) {
                tramDue = tramDue + " &#9432;";
            }

            tramDue = $("<div/>", {
                class: "clickable",
                "data-toggle": "modal",
                "data-target": "#" + dest + millis + "Modal"
            }).html(tramDue);

            return tramDue;
        };

        $("#predBody").empty();
        $(".tramTimeModal").remove();
        $(".tramDestModal").remove();
        predictions = Object.keys(predictions)
            .sort()
            .reduce((r, k) => ((r[k] = predictions[k]), r), {});
        for (dest in predictions) {
            predictions[dest].sort(function(a, b) {
                return a.predictedArriveTime - b.predictedArriveTime;
            });
            makeDestModal(dest, predictions[dest], lastUpdate);
            rowSpan = 1;
            if (predictions[dest].length > 1) {
                rowSpan = 2;
            }
            $("#predBody").append([
                $("<tr/>").append([
                    $("<th/>", {
                        scope: "row",
                        rowspan: rowSpan,
                        class: "align-middle"
                    }).append([
                        $("<div/>", {
                            class: "clickable",
                            "data-toggle": "modal",
                            "data-target": "#" + dest + "Modal"
                        }).text(dest)
                    ]),
                    $("<td/>").append([
                        getTramDue(
                            dest,
                            predictions[dest][0]["predictedArriveTime"],
                            predictions[dest][0]["warnings"],
                            predictions[dest][0]["predictions"]
                        )
                    ]),
                    $("<td/>").text(predictions[dest][0]["carriages"])
                ])
            ]);
            if (predictions[dest].length > 1) {
                $("#predBody").append([
                    $("<tr/>").append([
                        $("<td/>").append([
                            getTramDue(
                                dest,
                                predictions[dest][1]["predictedArriveTime"],
                                predictions[dest][1]["warnings"],
                                predictions[dest][1]["predictions"]
                            )
                        ]),
                        $("<td/>").text(predictions[dest][1]["carriages"])
                    ])
                ]);
            } else {
                $("#predBody").append([
                    $("<tr/>", {
                        class: "tr0"
                    }).append([
                        $("<td/>", {
                            class: "td0"
                        }),
                        $("<td/>", {
                            class: "td0"
                        })
                    ])
                ]);
            }
        }
    };

    var displayMessages = function(messages) {
        uniqueMessages = Array.from(new Set(messages));
        var index = -1;
        do {
            index = uniqueMessages.indexOf(null);
            if (index !== -1) uniqueMessages.splice(index, 1);
        } while (index !== -1);

        $("#messBody").empty();

        if (uniqueMessages.length === 0) {
            $("#messBody").append([
                $("<tr/>").append([
                    $("<th/>", {
                        scope: "row",
                        class: "align-middle"
                    }).text("Platform Messages"),
                    $("<td/>")
                ])
            ]);
            return;
        }

        $("#messBody").append([
            $("<tr/>").append([
                $("<th/>", {
                    scope: "row",
                    rowspan: uniqueMessages.length,
                    class: "align-middle"
                }).text("Platform Messages"),
                $("<td/>").text(uniqueMessages[0])
            ])
        ]);

        for (x = 1; x < uniqueMessages.length; x++) {
            $("#messBody").append([
                $("<tr/>").append([$("<td/>").text(uniqueMessages[x])])
            ]);
        }
    };

    var updateTrams = function(stn) {
        $("#stationDDB").text(stn);
        $("#stationDDB").val(stn);
        $("#updateB").removeAttr("disabled");
        $("#updateProg").removeClass("d-none");
        $("#pred").removeClass("d-none");
        $("#mess").removeClass("d-none");
        $("#ssAlert").addClass("d-none");
        $("#updateProgBar").width("0%");
        $("#updateProgBar").attr("aria-valuenow", 0);

        if (getCookie("destTip") == "") {
            $("#alerts").append([
                $("<div/>", {
                    class: "alert alert-info alert-dismissible fade show",
                    role: "alert",
                    id: "destTip"
                }).append([
                    $("<strong/>").text("Tip!"),
                    " Click a destination to see more predictions.",
                    $("<button/>", {
                        type: "button",
                        class: "close",
                        "data-dismiss": "alert",
                        "aria-label": "Close"
                    }).append([
                        $("<span/>", {
                            "aria-hidden": true
                        }).html("&times;")
                    ])
                ])
            ]);

            $("#destTip").on("closed.bs.alert", function(e) {
                setCookie("destTip", true, 365);
            });
        }

        if (getCookie("timeTip") == "") {
            $("#alerts").append([
                $("<div/>", {
                    class: "alert alert-info alert-dismissible fade show",
                    role: "alert",
                    id: "timeTip"
                }).append([
                    $("<strong/>").text("Tip!"),
                    " Click a tram's time to see arrival times along its route.",
                    $("<button/>", {
                        type: "button",
                        class: "close",
                        "data-dismiss": "alert",
                        "aria-label": "Close"
                    }).append([
                        $("<span/>", {
                            "aria-hidden": true
                        }).html("&times;")
                    ])
                ])
            ]);

            $("#timeTip").on("closed.bs.alert", function(e) {
                setCookie("timeTip", true, 365);
            });
        }

        $.getJSON(apiBase + "station/" + stn + "/?verbose=true", function(
            stationData
        ) {
            var platforms = stationData["platforms"];
            var current = 0;
            var predictions = {};
            var lastUpdate = 0;
            var messages = [];

            $("#updateProgBar").attr("aria-valuemax", 1);
            $("#updateProgBar").attr("aria-valuenow", 1);
            $("#updateProgBar").width("100%");

            for (p in platforms) {
                platformData = platforms[p];
                if (lastUpdate < Date.parse(platformData["updateTime"])) {
                    lastUpdate = Date.parse(platformData["updateTime"]);
                }
                messages[current] = platformData["message"];
                curPredictions = platformData["predictions"];
                curHere = platformData["here"];

                var updateDate = new Date(platformData["updateTime"]);
                /*Make sure update time is valid*/
                if (updateDate.getTime() > 0) {
                    $("#lastUpdated").text(
                        "Data Updated: " + updateDate.toLocaleString()
                    );
                }

                for (x in curPredictions) {
                    curPrediction = curPredictions[x];
                    curDest = curPrediction["dest"];
                    curDestNoVia = curPrediction["dest"];
                    if (curPrediction["via"] != null) {
                        curDest = curDest + " via " + curPrediction["via"];
                    }

                    if (curDest in predictions === false) {
                        predictions[curDest] = [];
                    }

                    var tramPredictions = [];

                    if (curPrediction["curLoc"]["status"] == "here") {
                        tramPredictions.push({
                            station: curPrediction["curLoc"]["platform"].split(
                                "_"
                            )[0],
                            predictedArriveTime: -1
                        });
                    }

                    destFound = false;
                    for (p in curPrediction["predictions"]) {
                        station = p.split("_")[0];
                        if (station == curDestNoVia) {
                            destFound = true;
                        }
                        tramPredictions.push({
                            station: p.split("_")[0],
                            predictedArriveTime: Date.parse(
                                curPrediction["predictions"][p]
                            )
                        });
                    }

                    tramPredictions.sort(function(a, b) {
                        return a.predictedArriveTime - b.predictedArriveTime;
                    });

                    details = {
                        predictedArriveTime: Date.parse(
                            curPrediction["predictedArriveTime"]
                        ),
                        carriages: curPrediction["carriages"],
                        predictions: tramPredictions,
                        warnings: []
                    };

                    if (curPrediction["curLoc"]["status"] == "dueStartsHere") {
                        details["warnings"].push("notStarted");
                    }

                    if (destFound == false) {
                        details["warnings"].push("noDestPred");
                    }

                    predictions[curDest].push(details);
                }

                for (x in curHere) {
                    tramHere = curHere[x];
                    tramDest = tramHere["dest"];
                    tramDestNoVia = tramHere["dest"];

                    if (tramHere["via"] != null) {
                        tramDest = tramDest + " via " + tramHere["via"];
                    }

                    if (tramDest in predictions === false) {
                        predictions[tramDest] = [];
                    }

                    var tramPredictions = [];

                    tramPredictions.push({
                        station: stn,
                        predictedArriveTime: -1
                    });

                    destFound = false;
                    for (p in tramHere["predictions"]) {
                        station = p.split("_")[0];
                        if (station == tramDestNoVia) {
                            destFound = true;
                        }
                        tramPredictions.push({
                            station: station,
                            predictedArriveTime: Date.parse(
                                tramHere["predictions"][p]
                            )
                        });
                    }

                    tramPredictions.sort(function(a, b) {
                        return a.predictedArriveTime - b.predictedArriveTime;
                    });

                    details = {
                        predictedArriveTime: -1,
                        carriages: tramHere["carriages"],
                        predictions: tramPredictions,
                        warnings: []
                    };

                    if (destFound == false) {
                        details["warnings"].push("noDestPred");
                    }

                    predictions[tramDest].push(details);
                }

                current++;

                $("#updateProgBar").attr("aria-valuenow", current + 1);
                $("#updateProgBar").width(
                    100 * (current + 1) / (platforms.length + 1) + "%"
                );
            }
            displayTrams(predictions, lastUpdate);
            displayMessages(messages);
        });
    };

    if (getCookie("cookiesAccepted") == "") {
        $("#cookieModal").modal("show");
    }

    $("#cookieModal").on("hidden.bs.modal", function(e) {
        setCookie("cookiesAccepted", true, 365);
    });

    $("#stationDD").on("click", "a", function() {
        setCookie("station", $(this).text(), 365);
        updateTrams($(this).text());
    });

    $("#updateB").on("click", function() {
        if ($("#stationDDB").val() != "null") {
            updateTrams($("#stationDDB").val());
        }
    });

    if (location.hash !== "") {
        updateTrams(decodeURIComponent(location.hash.substring(1)));
    } else if (getCookie("station") !== "") {
        location.hash = "#" + getCookie("station");
        updateTrams(getCookie("station"));
    }
});
