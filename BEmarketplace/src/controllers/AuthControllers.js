const {db}=require('../connections')
const {encrypt,transporter}=require('../helpers')
const {createJWToken} = require('../helpers/jwt')
const otp = require('../helpers/otp')
const nodemailer = require('nodemailer')
const fs =require('fs')
const handlebars=require('handlebars')
// const {createJWToken}=require('./../helpers/jwt')



module.exports={

    Hire:(req,res)=>{
        const {nama,email,message,subject} = req.body
        let data ={
            nama,
            email,
            subject,
            message
        }
        sql=`insert into hireme set ?`
        db.query(sql,data,(err,resultEmail)=>{
            if(err) return res.status(500).send({message:'server error pertama', message:err.message})
            // const token=createJWToken({id:userLogin[0].id,username:userLogin[0].username})
            // const link=`http://localhost:3000/verified?token=${token}`
            const htmlrender=fs.readFileSync('./template/email.html','utf8')
            const template=handlebars.compile(htmlrender)
            const htmlemail=template({name:'Bayu Darmawan',subject:subject,message:message, email:email})
            
            transporter.sendMail({
                from : email,
                to:'gorillajajan@gmail.com',
                // from:'Open Trip bisa, open BO ayo <darmawanbayu1@gmail.com>',
                // to:email,
                subject:subject,
                // html: `<H1> JOIN NOW! CLICK WHEREVER YOU WANT <a>JOIN JANCOK </a></H1>` // nanti diganti jd htmlemail line 46 kalo udh bisa pake handlebars
                html:htmlemail
            }).then(()=>{
                    // userLogin[0].token=token
                    return res.send('kirim email berhasil')
            }).catch((err)=>{
                return res.status(500).send({message:err.message})
            })

        })


    },
    Register:(req,res)=>{
           
            const {username,email,password} = req.body
            let sql=`select * from users where username = ?`
            db.query(sql,[username],(err,users)=>{
                if(err){
                    return res.status(500).send({message:"server error di auth controllers"})
                }
                if(users.length){
                    return res.status(500).send({message:'username telah dipakai'})
                }else {
                    let hashpassword=encrypt(password)
                    console.log(username,email,password)
                    let data={
                        username:username,
                        email,
                        password:hashpassword,
                        roleid:0,
                        lastlogin:new Date(),
                        statusver:'unverified',
                        otp:otp

                    }
                    sql=`insert into users set?`
                    db.query(sql,data,(err,results)=>{
                        if(err) return res.status(500).send({message:'server error di users set',message:err.message})
                        console.log('berhasil post data')
                        
                        sql=`select * from users where id = ?`
                        db.query(sql,[results.insertId],(err,userLogin)=>{
                            if(err){
                                return res.status(500).send({message:'server error di line 78'})
                            }
                            // const token=createJWToken({id:userLogin[0].id,username:userLogin[0].username})
                            // const link=`http://localhost:8001/verified?token=${token}`
                            // const token = otp
                            // console.log(token)
                            let otptest=Math.random()
                                otptest = otptest * 10000;
                                otptest = parseInt(otptest);
                                // console.log(otp,'ini kode otp dari helpers');
                            const createOTP= otp
                            console.log(createOTP, 'ini otp line 86')
                            const htmlrender=fs.readFileSync('./template/token.html','utf8')
                            const template=handlebars.compile(htmlrender)
                            const htmlemail=template({name:userLogin[0].username,otp:createOTP})

                            transporter.sendMail({
                                from:'UJIAN BACKEND TERCINTA, <darmawanbayu1@gmail.com>',
                                to:email,
                                subject:'gak lulus berarti open BO',
                                html:htmlemail
                            }).then(()=>{
                                
                            }).catch((err)=>{
                                return res.status(500).send({message:err.message})
                            })

                            
                        })
                    })
                }


            })

    },
    verified:(req,res)=>{
        // const {id}=req.user
        const{token,id}=req.body

        sql=`select * from users where id=${db.escape(id)}`    
        db.query(sql,(err,datauser)=>{
            if(err)return res.status(500).send({message:err.message})
            if(datauser[0].otp === token){
                let dataedit={
                    statusver:'Verified'
                }
                sql=`update Users set ? where id=${db.escape(id)}`
                db.query(sql,dataedit,(err,results)=>{
                    if(err) return res.status(500).send({message:err.message})
                    sql=`select * from users where id=${db.escape(id)}`
                    db.query(sql,(err,resultsUser)=>{
                        if(err) return res.status(500).send({message:err.message})
                        const htmlrender=fs.readFileSync('./template/verified.html','utf8')
                        const template=handlebars.compile(htmlrender)
                            // const htmlemail=template({name:userLogin[0].username,otp:createOTP})
                        const htmlemail=template({name:resultsUser[0].username,})
                        transporter.sendMail({
                            from:'ujian backend Tercinta <darmawanbayu1@gmail.com>',
                            to:resultsUser[0].email,
                            subject:'Verification anda Berhasil,',
                            html:htmlemail
                        },(err)=>{
                            if(err)return res.status(500).send({message:err.message})
                            
                        })
                        return res.send(resultsUser[0])
                    })
                })
                
            }
        })   
    },

    sendverified:(req,res)=>{
        const {username,email,id}=req.body
        const createOTP= otp
        let sql=`update Users set ? where id=${db.escape(id)}`
        let dataupdate={
            otp:createOTP
        }
        db.query(sql,dataupdate,(err,datauser)=>{
            if(err)return res.status(500).send({message:err.message})
            const htmlrender=fs.readFileSync('./template/sendverify.html','utf8')
                const template=handlebars.compile(htmlrender)
                
                const htmlemail=template({name:username,otp:createOTP})
                transporter.sendMail({
                    from:'UJIAN BACKEND TERCINTA, <darmawanbayu1@gmail.com>',
                    to:email,
                    subject:'KIRIM ULANG TOKEN!',
                    html:htmlemail
                },(err)=>{
                    if(err) return res.status(500).send({message:err.message})
                    // return res.send('kirim ulang berhasil')
                })
                
                return res.send(datauser)
            
        })



        
    },




    Login:(req,res)=>{
        const{username,password}=req.body
        let hashpassword=encrypt(password)
        let sql=`select * from Users where username = ? and password = ?`
        db.query(sql,[username,hashpassword],(err,dataUsers)=>{
            console.log(dataUsers)
                if(err)return res.status(500).send({message:err.message})
            if(!dataUsers.length){
                return res.status(500).send({message:'user tidak terdaftar'})
            }
            sql=`select td.qty,p.namaproduct,p.banner,p.harga,p.id as idprod,t.id as idtrans 
            from transactionsdetail td 
            join Transactions t on td.transactions_id=t.id 
            join product p on td.product_id=p.id
            where t.status='onCart' and t.users_id=1 and td.isdeleted=0;`
            db.query(sql,[dataUsers[0].id], (err,cart)=>{
                if(err) return res.status(500).send({message:err.message})
                const token=createJWToken({id:dataUsers[0].id,username:dataUsers[0].username})
                dataUsers[0].token=token
                return res.send({datauser:dataUsers[0],cart:cart})
            })    
        })  
    },
    Pendapatan:(req,res)=>{
        let sql =`select   
        sum(t.quantity * hargabeli * 0.1) as potential
        from users u
        join transaksi t
        on t.userid= u.id`
        db.query(sql,(err,potenpen)=>{
            console.log('jalan poten pen')
            if(err)res.status(500).send({message:'potenpen error'})
            sql=`select 
            sum(t.quantity * hargabeli * 0.1) as pendapatanNow
            from users u 
            join transaksi t
            on t.userid = u.id
            where t.status='Finished'`
            db.query(sql,(err,penskr)=>{
                console.log('jalan di penskr')
                if(err) res.status(500).send({message:'penskr error'})
                return res.send({potenpen,penskr})
                // return res.send('berhasil')
            })
        })
    },
    bestPenjual:(req,res)=>{
        let sql = `select p.id, p.namatoko,t.status, sum(t.hargabeli*t.quantity) as totalPenjualan
        from penjual p
        join transaksi t
        on t.penjualid=p.id
        where t.status='Finished'
        group by p.id;`
        db.query(sql,(err,bestpen)=>{
            console.log('jalan di best penjual')
            if(err) res.status(500).send({message:'Error penjual'})
            return res.send(bestpen)
        })
    },
    penjualbknPembeli:(req,res)=>{
        let sql=`select  count(*) as penjualYgBukanPembeli
        from users u
        left join penjual p
        on u.id = p.userid
        where p.id is null;`
        db.query(sql,(err,penjual)=>{
            console.log('jalan di penjual')
            if(err) res.status(500).send({message:'error di penjual'})
            return res.send(penjual)
        })
    },
    bestProduct:(req,res)=>{
        let sql=`select p.image,pen.namatoko as namaPenjual,p.nama as namaProduct,pen.abouttoko, t.productid
        from products p
        join transaksi t
        on t.productid = p.id
        join penjual pen
        on pen.id = p.penjualid
        group by t.productid
        order by count(*) desc
        limit 6`
        db.query(sql,(err,best)=>{
            console.log('jalan best product')
            if(err) res.status(500).send({message:'error di bp'})
            return res.send(best)
        })
    },
    bestCategory:(req,res)=>{
       let sql=`select t.status, cp.namacategory, p.categoryprodid, count(p.categoryprodid) as bestCat
       from transaksi t
       join products p
       on p.id = t.id
       join category_products cp
       on cp.id = p.categoryprodid
       where t.status='Finished'
       group by p.categoryprodid
       order by bestCat desc;`
        db.query(sql,(err,bestcat)=>{
            console.log('error di best category')
            if(err) res.status(500).send({message:'error di bp'})
            return res.send(bestcat)
        })
    }
}