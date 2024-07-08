using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.Quiz;
using api.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly IQuizRepository _quizRepo;

        public QuizController(IQuizRepository quizRepository)
        {
            _quizRepo = quizRepository;
        }

        [HttpPost("Create")]
        [Authorize(Roles="Admin,Teacher")]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDto createQuizDto)
        {
            var result = await _quizRepo.CreateQuiz(createQuizDto);
            if(!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpPut("Update/{id}")]
        [Authorize(Roles="Admin,Teacher")]
        public async Task<IActionResult> UpdateQuiz([FromRoute] int id, [FromBody] UpdateQuizDto updateQuizDto)
        {
            var result = await _quizRepo.UpdateQuiz(id,updateQuizDto);

            if(!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpGet("GetById/{id}")]
        [Authorize(Roles="Admin,Teacher")]
        public async Task<IActionResult> GetQuizById(int id)
        {
            var result = await _quizRepo.GetQuizById(id);
            if (!result.IsSuccess)
            {
                return NotFound(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpDelete("delete/{id}")]
        [Authorize(Roles="Admin")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            var result = await _quizRepo.DeleteQuiz(id);
            if (!result.IsSuccess)
            {
                return NotFound(result.Error);
            }
            return Ok(result.Value);
        }
    }
}