using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.extensions;
using api.Extensions;
using api.interfaces;
using api.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using api.Mappers;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResultControleController : ControllerBase
    {
        private readonly UserManager<AppUser> _manager;
        private readonly IResultControleRepository _resultRepo;
        private readonly IWebHostEnvironment _environment;
        public ResultControleController(UserManager<AppUser> manager ,  IResultControleRepository resultRepo , IWebHostEnvironment environment)
        {
            _manager = manager;
            _resultRepo = resultRepo;
            _environment = environment;
        }
        [HttpPost("{id:int}")]
        public async Task<IActionResult> UploadSolution(IFormFile file , [FromRoute] int id){
            var username = User.GetUsername();
            var user = await _manager.FindByNameAsync(username);

            if (user == null)
                return BadRequest("User not found.");

            var result = await file.UploadControleReponse(_environment, username);

            if (!result.IsSuccess)
                return BadRequest(result.Error);
            var addResult = await _resultRepo.AddResult(user, id, result.Value);
            if(!addResult.IsSuccess)
                return BadRequest(result.Error);
            return Ok(result.Value);
        }
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetStudentAllResults()
        {
            var username = User.GetUsername();
            var user = await _manager.FindByNameAsync(username);

            if (user == null)
                return BadRequest("User not found.");

            var results = await _resultRepo.GetStudentAllResult(user);

            if (!results.IsSuccess)
                return BadRequest(results.Error);

            return Ok(results.Value);
        }
        [HttpGet("{controleId}")]
        [Authorize]
        public async Task<IActionResult> GetResultControleById(int controleId)
        {
            var username = User.GetUsername();
            var user = await _manager.FindByNameAsync(username);

            if (user == null)
                return BadRequest("User not found.");

            var result = await _resultRepo.GetResultControleById(user, controleId);

            if (!result.IsSuccess)
                return BadRequest(result.Error);
            

            return Ok(result.Value.ToResultControleDto());
        }
        [HttpDelete("{controleId}")]
        [Authorize]
        public async Task<IActionResult> RemoveResult(int controleId)
        {
            var username = User.GetUsername();
            var user = await _manager.FindByNameAsync(username);

            if (user == null)
                return BadRequest("User not found.");

            var result = await _resultRepo.RemoveResult(user, controleId);

            if (!result.IsSuccess)
                return BadRequest(result.Error);
            
            var filePath = Path.Combine(_environment.WebRootPath, result.Value.Reponse.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                try
                {
                    System.IO.File.Delete(filePath);
                }
                catch (Exception ex)
                {
                    return BadRequest($"File deletion failed: {ex.Message}");
                }
            }

            return Ok(result.Value);
        }
        [HttpGet("download/{fileName}")]
        [Authorize]
        public async Task<IActionResult> GetFile(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return BadRequest("Filename is not provided.");

            var filePath = Path.Combine(_environment.WebRootPath, "controlereponse", fileName);

            if (!System.IO.File.Exists(filePath))
                return NotFound("File not found.");

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;
            var contentType = "APPLICATION/octet-stream";
            return File(memory, contentType, Path.GetFileName(filePath));
        }
    }
}
