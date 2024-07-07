using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.QuizResult;
using api.Extensions;
using api.interfaces;
using api.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizResultController : ControllerBase
    {
        private readonly IQuizResultRepository _quizResultRepo;
        private readonly UserManager<AppUser> _userManager;
        public QuizResultController(IQuizResultRepository quizResultRepository, UserManager<AppUser> userManager)
        {
            _quizResultRepo = quizResultRepository;
            _userManager = userManager;
        }

         [HttpPost("Create")]
         [Authorize(Roles ="Student")]
        public async Task<IActionResult> CreateQuizResult([FromBody] CreateQuizResultDto createQuizResultDto)
        {
            var username = User.GetUsername();

            var student = await _userManager.FindByNameAsync(username);

            if(student != null)
            {
                var result = await _quizResultRepo.CreateQuizResult(student.Id, createQuizResultDto);
                if(!result.IsSuccess)
                {
                    return BadRequest(result.Error);
                }
                return Ok(result.Value);
            } 
            
            return BadRequest("Internel Error");
        }
    }
}