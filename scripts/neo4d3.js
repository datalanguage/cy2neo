function Neo(credsReader) {
	var me = {
		executeQuery: function(query, params, cb) {
			var creds = credsReader();
			$.ajax('/oauth/token', {
				type: "POST",
				data: JSON.stringify({
					clientId: creds.clientId,
					clientSecret: creds.clientSecret
				}),
				error: function(err) {
					cb(err);
				},
				beforeSend: function (xhr) {
				    xhr.setRequestHeader ("Content-Type", "application/json");
				    xhr.setRequestHeader ("x-api-key", creds.apiKey);
				},
				success: function(r) {
					var url = '/graph-search/hrp-eb/cypher?query='+query;
					var token = r.access_token;
					$.ajax(url, {
						type: "GET",
						error: function(err) {
							cb(err);
						},
						beforeSend: function (xhr) {
						    xhr.setRequestHeader ("x-api-key", creds.apiKey);
						    xhr.setRequestHeader ("Authorization", "Bearer " + token);
						},
						success: function(res) {
							if (res.errors && res.errors.length > 0) {
								cb(res.errors);
							} else {
								var rows = res.results.map(function(row) {
									var r = {};
									if (Array.isArray(row)) {
										row.forEach(function(value, index) {
											r[index.toString()] = value;
										});
									} else {
										Object.keys(row).forEach(function(key) {
											r[key] = row[key];
										});
									}
									return r;
								});
								var nodes = [];
								var rels = [];
								var labels = [];
								cb(null,{table:rows,graph:{nodes:nodes, links:rels},labels:labels});
							}

								// var cols = res.results[0].columns;
								// var rows = res.results[0].data.map(function(row) {
								// 	var r = {};
								// 	cols.forEach(function(col, index) {
								// 		r[col] = row.row[index];
								// 	});
								// 	return r;
								// });
								// var nodes = [];
								// var rels = [];
								// var labels = [];
							 //    function findNode(nodes, id) {
								//    for (var i=0;i<nodes.length;i++) {
								//       if (nodes[i].id == id) return i;
								//    }
								//    return -1;
							 //    }
								// res.results[0].data.forEach(function(row) {
								// 	row.graph.nodes.forEach(function(n) {
								// 	   var found = nodes.filter(function (m) { return m.id == n.id; }).length > 0;
								// 	   if (!found) {
								// 		  //n.props=n.properties;
								// 		  for(var p in n.properties||{}) { n[p]=n.properties[p];delete n.properties[p];} 
								// 		  delete n.properties;
								// 		  nodes.push(n);
								// 		  labels=labels.concat(n.labels.filter(function(l) { labels.indexOf(l) == -1 }))
								// 	   }
								// 	});
								// 	rels = rels.concat(row.graph.relationships.map(
								// 		function(r) { 
								// 		   return { id: r.id, start:r.startNode, end:r.endNode, type:r.type } }
								// 		));
								// });
								// cb(null,{table:rows,graph:{nodes:nodes, links:rels},labels:labels});
							// }
						}
					});
				}
			});
		}
	};
	return me;
}
