document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('esgQuestionnaire');
    const resultsContainer = document.getElementById('resultsContainer');
    const jsonDataOutput = document.getElementById('jsonDataOutput');
    const downloadButton = document.getElementById('downloadData');

    const indicatorSets = {
        p2_set1: {
            name: "综合指标 (E环境, S社会, G治理)",
            prefix: "p2_set1",
            type: "most",
            indicators: {
                "E": "E 环境指标",
                "S": "S 社会指标",
                "G": "G 治理指标"
            }
        },
        p2_set2: {
            name: "环境指标",
            prefix: "p2_set2",
            type: "most",
            indicators: {
                "E1": "E1 绿色设施",
                "E2": "E2 可再生/清洁能源利用",
                "E3": "E3 资源与能源效率",
                "E4": "E4 循环经济实践",
                "E5": "E5 包装与废弃物",
                "E6": "E6 “最后一公里”排放"
            }
        },
        p2_set3: {
            name: "社会指标",
            prefix: "p2_set3",
            type: "most",
            indicators: {
                "S1": "S1 公平待遇",
                "S2": "S2 公平劳动实践",
                "S3": "S3 培训与职业发展",
                "S4": "S4 工作人体工程学",
                "S5": "S5 职业健康与安全",
                "S6": "S6 社区参与和影响",
                "S7": "S7 利益相关者福祉"
            }
        },
        p2_set4: {
            name: "治理指标",
            prefix: "p2_set4",
            type: "most",
            indicators: {
                "G1": "G1 反腐败",
                "G2": "G2 高层承诺",
                "G3": "G3 合规",
                "G4": "G4 数据管理和保护",
                "G5": "G5 创新管理",
                "G6": "G6 风险管理",
                "G7": "G7 利益相关者参与"
            }
        },
        p3_set1: {
            name: "综合指标 (E环境, S社会, G治理)",
            prefix: "p3_set1",
            type: "least",
            indicators: {
                "E": "E 环境指标",
                "S": "S 社会指标",
                "G": "G 治理指标"
            }
        },
        p3_set2: {
            name: "环境指标",
            prefix: "p3_set2",
            type: "least",
            indicators: { /* Same as p2_set2 */ ...indicatorSets.p2_set2.indicators }
        },
        p3_set3: {
            name: "社会指标",
            prefix: "p3_set3",
            type: "least",
            indicators: { /* Same as p2_set3 */ ...indicatorSets.p2_set3.indicators }
        },
        p3_set4: {
            name: "治理指标",
            prefix: "p3_set4",
            type: "least",
            indicators: { /* Same as p2_set4 */ ...indicatorSets.p2_set4.indicators }
        }
    };
    // Correctly copy indicators for Part 3
    indicatorSets.p3_set2.indicators = { ...indicatorSets.p2_set2.indicators };
    indicatorSets.p3_set3.indicators = { ...indicatorSets.p2_set3.indicators };
    indicatorSets.p3_set4.indicators = { ...indicatorSets.p2_set4.indicators };


    const implementationSets = {
        p4_set1: {
            name: "环境指标实施水平",
            prefix: "p4_set1_impl",
            indicators: indicatorSets.p2_set2.indicators // E1-E6
        },
        p4_set2: {
            name: "社会指标实施水平",
            prefix: "p4_set2_impl",
            indicators: indicatorSets.p2_set3.indicators // S1-S7
        },
        p4_set3: {
            name: "治理指标实施水平",
            prefix: "p4_set3_impl",
            indicators: indicatorSets.p2_set4.indicators // G1-G7
        }
    };

    function createRatingScale(namePrefix, type) {
        const scaleContainer = document.createElement('div');
        scaleContainer.className = 'rating-scale';
        const maxScale = 9;
        let labels = [];
        if (type === "most") { // Most important比candidate重要多少 (1=同等, 9=极其重要)
            labels = ["1 (同等重要)", "2", "3", "4", "5 (中等重要)", "6", "7", "8", "9 (极其重要)"];
        } else { // Least important比candidate不重要多少 (1=同等不重要, 9=极其不重要)
            labels = ["1 (同等不重要)", "2", "3", "4", "5 (中等不重要)", "6", "7", "8", "9 (极其不重要)"];
        }

        for (let i = 1; i <= maxScale; i++) {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = namePrefix;
            radio.value = i;
            radio.addEventListener('change', () => { // Style selected radio
                Array.from(scaleContainer.querySelectorAll('label')).forEach(l => l.classList.remove('selected'));
                label.classList.add('selected');
            });
            label.appendChild(radio);
            label.appendChild(document.createTextNode(labels[i-1]));
            scaleContainer.appendChild(label);
        }
        return scaleContainer;
    }

    function setupIndicatorSet(setId) {
        const setData = indicatorSets[setId];
        if (!setData) return;

        const fieldset = document.getElementById(setId);
        const ratingsContainer = fieldset.querySelector('.ratings-container');
        const primaryChoiceRadios = fieldset.querySelectorAll(`input[name="${setData.prefix}_${setData.type}_important"]`);

        primaryChoiceRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                ratingsContainer.innerHTML = ''; // Clear previous ratings
                const selectedPrimaryIndicator = this.value;

                for (const indicatorKey in setData.indicators) {
                    if (indicatorKey === selectedPrimaryIndicator) {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'rating-item disabled';
                        itemDiv.innerHTML = `<p>${setData.indicators[indicatorKey]}: (您选择的${setData.type === 'most' ? '最' : '最不'}重要指标，不需评分)</p>`;
                        ratingsContainer.appendChild(itemDiv);
                    } else {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'rating-item';
                        let questionText = '';
                        if (setData.type === 'most') {
                            questionText = `您选择的"${setData.indicators[selectedPrimaryIndicator]}" 比 "${setData.indicators[indicatorKey]}" 重要多少?`;
                        } else {
                            questionText = `您选择的"${setData.indicators[selectedPrimaryIndicator]}" 比 "${setData.indicators[indicatorKey]}" 不重要多少?`;
                        }
                        itemDiv.innerHTML = `<p>${setData.indicators[indicatorKey]}: ${questionText}</p>`;
                        const scale = createRatingScale(`${setData.prefix}_rating_${indicatorKey}`, setData.type);
                        itemDiv.appendChild(scale);
                        ratingsContainer.appendChild(itemDiv);
                    }
                }
            });
        });
    }

    function createImplementationScale(namePrefix) {
        const scaleContainer = document.createElement('div');
        scaleContainer.className = 'implementation-scale';
        const labels = ["1 (最低)", "2", "3 (中等)", "4", "5 (最高)"];
        for (let i = 1; i <= 5; i++) {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = namePrefix;
            radio.value = i;
            radio.addEventListener('change', () => { // Style selected radio
                Array.from(scaleContainer.querySelectorAll('label')).forEach(l => l.classList.remove('selected'));
                label.classList.add('selected');
            });
            label.appendChild(radio);
            label.appendChild(document.createTextNode(labels[i-1]));
            scaleContainer.appendChild(label);
        }
        return scaleContainer;
    }

    function setupImplementationSet(setId) {
        const setData = implementationSets[setId];
        if(!setData) return;

        const fieldset = document.getElementById(setId);
        for (const indicatorKey in setData.indicators) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'rating-item';
            itemDiv.innerHTML = `<p>${setData.indicators[indicatorKey]}: 请评估当前实施水平。</p>`;
            const scale = createImplementationScale(`${setData.prefix}_${indicatorKey}`);
            itemDiv.appendChild(scale);
            fieldset.appendChild(itemDiv);
        }
    }

    // Initialize Part 2 and Part 3 sets
    for (const setId in indicatorSets) {
        setupIndicatorSet(setId);
    }

    // Initialize Part 4 sets
    for (const setId in implementationSets) {
        setupImplementationSet(setId);
    }


    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = {
            part1: {},
            part2_most_important: {},
            part3_least_important: {},
            part4_implementation_level: {}
        };

        // Part 1
        data.part1.q1_position = formData.get('q1_position');
        if (data.part1.q1_position === 'other') {
            data.part1.q1_position_other = formData.get('q1_position_other');
        }
        data.part1.q2_experience = formData.get('q2_experience');
        data.part1.q3_prof_services = formData.get('q3_prof_services');
        data.part1.q4_esg_services = formData.get('q4_esg_services');
        data.part1.q5_participation = formData.get('q5_participation');

        // Part 2 & 3
        for (const setId in indicatorSets) {
            const setData = indicatorSets[setId];
            const section = setData.type === 'most' ? data.part2_most_important : data.part3_least_important;
            const primaryChoice = formData.get(`${setData.prefix}_${setData.type}_important`);
            if (primaryChoice) {
                section[setData.prefix] = {
                    [`${setData.type}_important_indicator`]: primaryChoice,
                    ratings: {}
                };
                for (const indicatorKey in setData.indicators) {
                    if (indicatorKey !== primaryChoice) {
                        const rating = formData.get(`${setData.prefix}_rating_${indicatorKey}`);
                        if (rating) {
                            section[setData.prefix].ratings[indicatorKey] = parseInt(rating);
                        }
                    }
                }
            }
        }

        // Part 4
        for (const setId in implementationSets) {
            const setData = implementationSets[setId];
            data.part4_implementation_level[setData.prefix] = {};
            for (const indicatorKey in setData.indicators) {
                const level = formData.get(`${setData.prefix}_${indicatorKey}`);
                if (level) {
                    data.part4_implementation_level[setData.prefix][indicatorKey] = parseInt(level);
                }
            }
        }

        const jsonData = JSON.stringify(data, null, 2);
        jsonDataOutput.value = jsonData;
        resultsContainer.style.display = 'block';
        jsonDataOutput.focus();
        jsonDataOutput.select();
    });

    downloadButton.addEventListener('click', function() {
        const jsonData = jsonDataOutput.value;
        if (!jsonData) {
            alert("没有数据可供下载。请先提交问卷。");
            return;
        }
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'esg_questionnaire_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

});
