
const response = (status,message="success",data,role_id,req,res,err,token) => {
	data=(data)?data:{};
	let fetchData={};
	if(err){
		fetchData= {status:status, data: data, "message": err.message };
	}else{
		fetchData= {status:status, data: data, "message": message };
	}
	if(role_id){
		fetchData["role_id"]=role_id;
	}
	if(token){
		fetchData["token"]=token;
	}

	// switch (true) {
    //     case typeof err === 'string':
    //         // custom application error
    //         const is404 = err.toLowerCase().endsWith('not found');
    //         const statusCode = is404 ? 404 : 400;
    //         return res.status(statusCode).json({"status":statusCode, data: {}, "message": err });
    //     // case err.name === 'UnauthorizedError':
    //     //     // jwt authentication error
    //     //     return res.status(401).json({"status":401, data: {}, "message": 'Unauthorized' });
    //     default:
    //         return res.status(500).json({"status":500, data: {}, "message": err.message });
    // }
	
	return res.json(fetchData);
};
module.exports = response;